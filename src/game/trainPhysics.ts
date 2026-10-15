import { TrainType, TrainState, SignalAspect } from '../types/game';
import { TRAIN_CONFIGS } from './trainModels';
import { TrackNetwork } from './trackNetwork';
import { railAudio } from '../audio/railAudio';

export class TrainPhysicsEngine {
  public state: TrainState;
  public trainType: TrainType;
  private track: TrackNetwork;

  constructor(trainType: TrainType, track: TrackNetwork) {
    this.trainType = trainType;
    this.track = track;

    this.state = {
      currentDistance: 200, // Start just outside New Delhi platform
      speedKmh: 0,
      speedMs: 0,
      throttleNotch: 0,
      reverser: 1,
      trainBrake: 0,
      dynamicBrake: 0,
      emergencyBrake: false,
      headlights: 'bright',
      cabLight: false,
      wipersActive: false,
      pantographRaised: true,
      hornActive: false,
      isWheelslipping: false,
      tractiveEffortKn: 0,
      brakePipePressureBar: 5.0,
      lineVoltageKv: 25.0,
      doorsOpen: false,
      kavachAlert: null,
    };
  }

  public setTrainType(type: TrainType) {
    this.trainType = type;
  }

  public setThrottleNotch(notch: number) {
    // 0 to 8 notches
    this.state.throttleNotch = Math.max(0, Math.min(8, notch));
    // If doors open, automatically close doors when throttle applied
    if (this.state.throttleNotch > 0 && this.state.doorsOpen) {
      this.state.doorsOpen = false;
    }
  }

  public setTrainBrake(brake: number) {
    const prevBrake = this.state.trainBrake;
    this.state.trainBrake = Math.max(0, Math.min(1.0, brake));
    if (this.state.trainBrake > 0.4 && prevBrake <= 0.4) {
      railAudio.playBrakeHiss();
    }
  }

  public setReverser(dir: 1 | 0 | -1) {
    // Interlock: Only change reverser if nearly stopped
    if (Math.abs(this.state.speedKmh) < 1.0) {
      this.state.reverser = dir;
    }
  }

  public toggleEmergencyBrake() {
    this.state.emergencyBrake = !this.state.emergencyBrake;
    if (this.state.emergencyBrake) {
      this.state.throttleNotch = 0;
      this.state.trainBrake = 1.0;
      railAudio.playBrakeHiss();
    }
  }

  public togglePantograph() {
    this.state.pantographRaised = !this.state.pantographRaised;
    this.state.lineVoltageKv = this.state.pantographRaised ? 25.0 : 0.0;
  }

  public toggleDoors() {
    // Only open doors if train is completely stopped
    if (Math.abs(this.state.speedKmh) < 0.2) {
      this.state.doorsOpen = !this.state.doorsOpen;
    }
  }

  /**
   * Main Physics Tick (called every animation frame with dt in seconds)
   */
  public update(dt: number, weather: string) {
    const cfg = TRAIN_CONFIGS[this.trainType];
    const massKg = cfg.weightTons * 1000;
    const maxHorsepower = cfg.horsepower;
    const maxPowerWatts = maxHorsepower * 745.7;

    // 1. Line Voltage & Power Available
    const hasPower = this.state.pantographRaised && this.state.lineVoltageKv > 20.0;
    const throttleRatio = this.state.throttleNotch / 8.0;

    // 2. Tractive Effort Calculation (kN)
    let availableForceN = 0;
    if (hasPower && !this.state.emergencyBrake && this.state.trainBrake < 0.1 && this.state.reverser !== 0) {
      const currentSpeedMs = Math.max(1.5, Math.abs(this.state.speedMs));
      // Force = Power / Velocity, capped by starting adhesion limit
      const powerLimitN = (maxPowerWatts * throttleRatio) / currentSpeedMs;
      const adhesionLimitN = massKg * 9.81 * (weather === 'monsoon' ? 0.22 : 0.35) * throttleRatio;

      availableForceN = Math.min(powerLimitN, adhesionLimitN);

      // Check Wheel Slip (wet rails during monsoon rain)
      if (weather === 'monsoon' && throttleRatio > 0.7 && Math.abs(this.state.speedKmh) < 30) {
        this.state.isWheelslipping = true;
        availableForceN *= 0.6; // Loss of traction
      } else {
        this.state.isWheelslipping = false;
      }

      availableForceN *= this.state.reverser;
    } else {
      this.state.isWheelslipping = false;
    }

    this.state.tractiveEffortKn = Math.round(Math.abs(availableForceN) / 1000);

    // 3. Train Resistance (Davis Equation: Rolling + Aerodynamic Drag)
    const v = this.state.speedMs;
    const sign = v >= 0 ? 1 : -1;
    const rollingResistanceN = (10 + 0.15 * Math.abs(v)) * cfg.weightTons * 9.81 * 0.001 * 1000;
    const frontalArea = this.trainType === 'vande_bharat' ? 10.0 : 12.5;
    const dragCoeff = this.trainType === 'vande_bharat' ? 0.28 : 0.45;
    const airDragN = 0.5 * 1.225 * dragCoeff * frontalArea * v * v;
    const totalResistanceN = (rollingResistanceN + airDragN) * sign;

    // 4. Braking Force (Pneumatic Air Brake + Dynamic Brake)
    let totalBrakeForceN = 0;
    if (this.state.emergencyBrake) {
      totalBrakeForceN = massKg * 1.4; // 1.4 m/s² emergency deceleration
      this.state.brakePipePressureBar = 0.0;
    } else {
      const brakeApp = Math.max(this.state.trainBrake, this.state.dynamicBrake);
      totalBrakeForceN = massKg * 0.85 * brakeApp; // Up to 0.85 m/s² service braking
      this.state.brakePipePressureBar = 5.0 - brakeApp * 1.5; // 5.0 bar down to 3.5 bar
    }

    if (Math.abs(v) > 0.05) {
      totalBrakeForceN *= sign;
    } else {
      totalBrakeForceN = 0;
    }

    // 5. Net Force & Acceleration ($F = ma$)
    const netForceN = availableForceN - totalResistanceN - totalBrakeForceN;
    let accelerationMs2 = netForceN / massKg;

    // Zero speed clamp when stopped with brakes on
    if (Math.abs(this.state.speedMs) < 0.1 && availableForceN === 0) {
      accelerationMs2 = 0;
      this.state.speedMs = 0;
      this.state.speedKmh = 0;
    } else {
      this.state.speedMs += accelerationMs2 * dt;
      // Cap at top design speed
      const maxMs = (cfg.maxSpeedKmh / 3.6);
      this.state.speedMs = Math.max(-maxMs * 0.3, Math.min(maxMs, this.state.speedMs));
      this.state.speedKmh = this.state.speedMs * 3.6;
    }

    // 6. Integrate Position along track
    this.state.currentDistance += this.state.speedMs * dt;
    if (this.state.currentDistance < 0) {
      this.state.currentDistance += this.track.totalLength;
    }

    // 7. KAVACH Automatic Train Protection System
    this.evaluateKavachSafety();

    // 8. Update Audio Synthesizer
    railAudio.updateSpeedAudio(
      this.state.speedKmh,
      this.state.throttleNotch,
      this.state.trainBrake > 0.1 || this.state.emergencyBrake
    );
  }

  /**
   * Indian Railways KAVACH Train Protection & Signal Evaluation
   */
  private evaluateKavachSafety() {
    const nextSig = this.track.getNextSignal(this.state.currentDistance);
    if (!nextSig) {
      this.state.kavachAlert = null;
      return;
    }

    const { signal, distanceTo } = nextSig;

    if (signal.aspect === 'red') {
      if (distanceTo < 300 && this.state.speedKmh > 35) {
        this.state.kavachAlert = `KAVACH ALERT: RED SIGNAL IN ${Math.round(distanceTo)}M! REDUCE SPEED!`;
      }
      if (distanceTo < 60 && this.state.speedKmh > 15) {
        // Automatic Safety Intervention
        this.state.kavachAlert = 'KAVACH AUTO-BRAKE ENGAGED! (SPAD PREVENTION)';
        this.state.emergencyBrake = true;
        this.state.throttleNotch = 0;
      }
    } else if (signal.aspect === 'yellow') {
      if (this.state.speedKmh > signal.targetSpeedKmh + 10) {
        this.state.kavachAlert = `CAUTION SIGNAL: SPEED LIMIT ${signal.targetSpeedKmh} KM/H`;
      } else {
        this.state.kavachAlert = null;
      }
    } else {
      this.state.kavachAlert = null;
    }
  }
}
