export type TrainType = 'vande_bharat' | 'rajdhani' | 'shatabdi' | 'passenger_mail' | 'freight_heavy';

export interface TrainConfig {
  id: TrainType;
  name: string;
  hindiName: string;
  locoType: string;
  category: 'High-Speed EMU' | 'Superfast LHB' | 'Premium Intercity' | 'Express Mail' | 'Heavy Freight';
  maxSpeedKmh: number;
  horsepower: number;
  weightTons: number;
  carsCount: number;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    roof: string;
  };
  traction: 'Electric AC 25kV' | 'Diesel-Electric';
  description: string;
  unlockedByDefault: boolean;
}

export type WeatherType = 'day' | 'sunset' | 'night' | 'monsoon' | 'fog';

export type CameraViewMode = 
  | 'cab'          // 1st person Loco Pilot cab view looking forward
  | 'chase'        // 3rd person follow camera behind the locomotive
  | 'orbit'        // Free 360 rotation around the train
  | 'railfan'      // Trackside stationary camera watching train pass by
  | 'window'       // Passenger cabin window view
  | 'top';         // High altitude aerial GPS view

export interface StationData {
  id: string;
  name: string;
  hindiName: string;
  regionalName?: string;
  code: string;
  trackPosition: number; // distance in meters along spline
  platformsCount: number;
  speedLimitKmh: number;
  state: string;
  description: string;
  sceneryType: 'metropolis' | 'rural' | 'heritage' | 'coastal' | 'valley';
}

export interface LevelCrossingData {
  id: string;
  trackPosition: number; // meters along spline
  name: string;
  isClosed: boolean;
  gateAngle: number; // 0 (open for cars) to 90 (closed for train)
}

export type SignalAspect = 'green' | 'double_yellow' | 'yellow' | 'red';

export interface SignalData {
  id: string;
  trackPosition: number;
  aspect: SignalAspect;
  targetSpeedKmh: number;
}

export interface TrainState {
  currentDistance: number;   // meters along track
  speedKmh: number;          // km/h
  speedMs: number;           // m/s
  throttleNotch: number;     // 0 to 8 (or 0 to 100%)
  reverser: 1 | 0 | -1;      // 1 = Forward, 0 = Neutral, -1 = Reverse
  trainBrake: number;        // 0.0 to 1.0 (applied)
  dynamicBrake: number;      // 0.0 to 1.0
  emergencyBrake: boolean;   // true if tripped
  headlights: 'off' | 'dim' | 'bright';
  cabLight: boolean;
  wipersActive: boolean;
  pantographRaised: boolean;
  hornActive: boolean;
  isWheelslipping: boolean;
  tractiveEffortKn: number;  // kilonewtons
  brakePipePressureBar: number; // typically 5.0 bar running, down to 3.5 bar full brake
  lineVoltageKv: number;     // 25.0 kV
  doorsOpen: boolean;
  kavachAlert: string | null;
}

export interface PlayerProgress {
  pilotName: string;
  rank: string;
  level: number;
  xp: number;
  totalDistanceKm: number;
  stationsVisited: string[];
  passengersTransported: number;
  cargoTonsDelivered: number;
  onTimeStops: number;
  violationsCount: number;
  unlockedTrains: TrainType[];
  selectedTrain: TrainType;
  lastSavedAt: string;
}
