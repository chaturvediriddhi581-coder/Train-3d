/**
 * Procedural Web Audio Engine for Indian Railways Simulation.
 * Zero external asset dependencies - all sounds generated mathematically in real-time.
 */

class RailAudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // Horn Nodes
  private hornGain: GainNode | null = null;
  private hornOsc1: OscillatorNode | null = null;
  private hornOsc2: OscillatorNode | null = null;
  private hornFilter: BiquadFilterNode | null = null;
  private isHornPlaying: boolean = false;

  // Inverter / Traction Motor Nodes (VVVF 3-phase sound)
  private tractionGain: GainNode | null = null;
  private tractionOsc: OscillatorNode | null = null;
  private tractionFilter: BiquadFilterNode | null = null;

  // Track Joint Rhythm (Clickety-clack)
  private lastJointTime: number = 0;
  private jointTimer: number | null = null;

  // Air Brakes
  private brakeNoiseGain: GainNode | null = null;

  // Ambience / Wind / Rails
  private ambientGain: GainNode | null = null;
  private ambientNoiseSource: AudioBufferSourceNode | null = null;

  // Crossing Bell
  private crossingGain: GainNode | null = null;

  private isInitialized: boolean = false;

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupTractionSound();
      this.setupAmbience();
      this.isInitialized = true;
    } catch {
      // AudioContext may be blocked until user gesture
    }
  }

  public ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.75, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Dual-tone Indian Railways Pneumatic Horn (High 620Hz + Low 440Hz with brass harmonic content)
   */
  public startHorn() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isHornPlaying) return;

    this.isHornPlaying = true;
    const now = this.ctx.currentTime;

    this.hornGain = this.ctx.createGain();
    this.hornGain.gain.setValueAtTime(0.001, now);
    this.hornGain.gain.exponentialRampToValueAtTime(0.65, now + 0.04);

    this.hornFilter = this.ctx.createBiquadFilter();
    this.hornFilter.type = 'lowpass';
    this.hornFilter.frequency.setValueAtTime(2600, now);
    this.hornFilter.Q.setValueAtTime(3.5, now);

    // High Tone (approx 622 Hz - Eb5)
    this.hornOsc1 = this.ctx.createOscillator();
    this.hornOsc1.type = 'sawtooth';
    this.hornOsc1.frequency.setValueAtTime(622, now);
    // Slight pitch bend down as air reservoir pressurizes
    this.hornOsc1.frequency.exponentialRampToValueAtTime(615, now + 0.15);

    // Low Tone (approx 440 Hz - A4)
    this.hornOsc2 = this.ctx.createOscillator();
    this.hornOsc2.type = 'sawtooth';
    this.hornOsc2.frequency.setValueAtTime(440, now);
    this.hornOsc2.frequency.exponentialRampToValueAtTime(435, now + 0.15);

    this.hornOsc1.connect(this.hornFilter);
    this.hornOsc2.connect(this.hornFilter);
    this.hornFilter.connect(this.hornGain);
    this.hornGain.connect(this.masterGain);

    this.hornOsc1.start(now);
    this.hornOsc2.start(now);
  }

  public stopHorn() {
    if (!this.ctx || !this.hornGain || !this.isHornPlaying) return;
    const now = this.ctx.currentTime;
    this.hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    setTimeout(() => {
      try {
        this.hornOsc1?.stop();
        this.hornOsc2?.stop();
        this.hornOsc1?.disconnect();
        this.hornOsc2?.disconnect();
        this.hornGain?.disconnect();
      } catch {}
      this.isHornPlaying = false;
      this.hornOsc1 = null;
      this.hornOsc2 = null;
      this.hornGain = null;
    }, 100);
  }

  /**
   * Sets up continuous VVVF 3-phase electric traction motor sound
   */
  private setupTractionSound() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    this.tractionGain = this.ctx.createGain();
    this.tractionGain.gain.setValueAtTime(0.0001, now);

    this.tractionFilter = this.ctx.createBiquadFilter();
    this.tractionFilter.type = 'bandpass';
    this.tractionFilter.frequency.setValueAtTime(250, now);
    this.tractionFilter.Q.setValueAtTime(4.0, now);

    this.tractionOsc = this.ctx.createOscillator();
    this.tractionOsc.type = 'sawtooth';
    this.tractionOsc.frequency.setValueAtTime(80, now);

    this.tractionOsc.connect(this.tractionFilter);
    this.tractionFilter.connect(this.tractionGain);
    this.tractionGain.connect(this.masterGain);

    this.tractionOsc.start();
  }

  /**
   * Continuous rolling wheel-on-track rumbling noise
   */
  private setupAmbience() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.ambientNoiseSource = this.ctx.createBufferSource();
    this.ambientNoiseSource.buffer = buffer;
    this.ambientNoiseSource.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    this.ambientNoiseSource.connect(noiseFilter);
    noiseFilter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);

    this.ambientNoiseSource.start();
  }

  /**
   * Updates motor pitch, wheel rumble, and joint cadence based on speed
   */
  public updateSpeedAudio(speedKmh: number, throttleNotch: number, isBraking: boolean) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const absSpeed = Math.abs(speedKmh);

    // 1. Traction motor inverter pitch (Indian VVVF stepped whine)
    if (this.tractionGain && this.tractionOsc && this.tractionFilter) {
      if (absSpeed < 0.5 && throttleNotch === 0) {
        this.tractionGain.gain.setTargetAtTime(0.001, now, 0.2);
      } else {
        const motorVolume = Math.min(0.28, 0.05 + (throttleNotch / 8) * 0.18 + (absSpeed / 140) * 0.1);
        this.tractionGain.gain.setTargetAtTime(motorVolume, now, 0.1);

        // VVVF stepped harmonic frequencies characteristic of WAP-7 / Vande Bharat
        let baseFreq = 80;
        if (absSpeed < 12) {
          baseFreq = 140 + absSpeed * 25; // low speed inverter ramp
        } else if (absSpeed < 35) {
          baseFreq = 300 + (absSpeed - 12) * 14;
        } else if (absSpeed < 75) {
          baseFreq = 500 + (absSpeed - 35) * 8;
        } else {
          baseFreq = 750 + (absSpeed - 75) * 4;
        }
        this.tractionOsc.frequency.setTargetAtTime(Math.min(1400, baseFreq), now, 0.1);
        this.tractionFilter.frequency.setTargetAtTime(Math.min(2200, baseFreq * 1.5), now, 0.1);
      }
    }

    // 2. Rolling track noise
    if (this.ambientGain) {
      const rollVolume = Math.min(0.35, (absSpeed / 130) * 0.3);
      this.ambientGain.gain.setTargetAtTime(rollVolume, now, 0.15);
    }

    // 3. Steel wheel on rail clickety-clack joints
    if (absSpeed > 5) {
      // Joint interval in seconds: Rail joints every 25m in India (or 13m bolted joints)
      const jointIntervalSec = (25 / (Math.max(1, absSpeed) * 0.2777)) * 0.5;
      const currentTimeSec = performance.now() / 1000;
      if (currentTimeSec - this.lastJointTime > jointIntervalSec) {
        this.playRailJointClick(absSpeed);
        this.lastJointTime = currentTimeSec;
      }
    }
  }

  /**
   * Steel rail joint clatter: "ta-tack ... ta-tack"
   */
  private playRailJointClick(speedKmh: number) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const intensity = Math.min(1.0, speedKmh / 90);

    const playClick = (timeOffset: number, pitch: number, vol: number) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(pitch, now + timeOffset);
      filter.Q.setValueAtTime(8, now + timeOffset);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, now + timeOffset);

      gain.gain.setValueAtTime(0.001, now + timeOffset);
      gain.gain.linearRampToValueAtTime(vol * intensity * 0.12, now + timeOffset + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.06);
    };

    // Leading bogie wheel hits joint
    playClick(0, 320, 0.9);
    playClick(0.04, 380, 0.7);
    // Trailing bogie wheel hits joint 0.12s later
    playClick(0.12, 310, 0.75);
    playClick(0.16, 360, 0.6);
  }

  /**
   * Air Brake exhaust release hiss ("pssshhhh")
   */
  public playBrakeHiss() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.7);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  /**
   * Level crossing alarm bell ringing ("Cling cling cling")
   */
  public playCrossingBell() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1860, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  /**
   * Indian Railway Station Chime ("Ting-Tong-Ting") + Announcement
   */
  public playStationChime(stationName: string, trainName: string, platform: number) {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const timing = [0, 0.22, 0.44, 0.68];

    notes.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + timing[i]);

      gain.gain.setValueAtTime(0.001, now + timing[i]);
      gain.gain.linearRampToValueAtTime(0.2, now + timing[i] + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timing[i] + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + timing[i]);
      osc.stop(now + timing[i] + 0.5);
    });

    // Synthesized speech announcement using browser SpeechSynthesis if available
    setTimeout(() => {
      if ('speechSynthesis' in window && !this.isMuted) {
        try {
          const hindiAnnounce = `Kripya dhyan dijiye. ${trainName}, ${stationName} platform number ${platform} par aa rahi hai.`;
          const utterance = new SpeechSynthesisUtterance(hindiAnnounce);
          utterance.rate = 0.95;
          utterance.pitch = 1.05;
          utterance.volume = 0.8;
          window.speechSynthesis.speak(utterance);
        } catch {}
      }
    }, 1200);
  }
}

export const railAudio = new RailAudioManager();
