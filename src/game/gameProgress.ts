import { PlayerProgress, TrainType } from '../types/game';

const STORAGE_KEY = 'bharat_rail_sim_progress_v1';

const DEFAULT_PROGRESS: PlayerProgress = {
  pilotName: 'Loco Pilot Sharma',
  rank: 'Senior Passenger Driver (Northern Railway)',
  level: 1,
  xp: 120,
  totalDistanceKm: 0,
  stationsVisited: ['delhi'],
  passengersTransported: 0,
  cargoTonsDelivered: 0,
  onTimeStops: 0,
  violationsCount: 0,
  unlockedTrains: ['vande_bharat', 'rajdhani', 'shatabdi', 'passenger_mail', 'freight_heavy'],
  selectedTrain: 'vande_bharat',
  lastSavedAt: new Date().toISOString(),
};

export class ProgressManager {
  private progress: PlayerProgress;

  constructor() {
    this.progress = this.load();
  }

  public getProgress(): PlayerProgress {
    return { ...this.progress };
  }

  public save(newProgress?: Partial<PlayerProgress>) {
    if (newProgress) {
      this.progress = { ...this.progress, ...newProgress, lastSavedAt: new Date().toISOString() };
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch {}
  }

  public load(): PlayerProgress {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(data) };
      }
    } catch {}
    return { ...DEFAULT_PROGRESS };
  }

  public reset() {
    this.progress = { ...DEFAULT_PROGRESS, lastSavedAt: new Date().toISOString() };
    this.save();
  }

  public addDistance(km: number) {
    this.progress.totalDistanceKm += km;
    this.progress.xp += Math.round(km * 15);
    this.checkLevelUp();
    this.save();
  }

  public recordStationStop(stationId: string, passengers: number, cargoTons: number, isSmooth: boolean) {
    if (!this.progress.stationsVisited.includes(stationId)) {
      this.progress.stationsVisited.push(stationId);
    }
    this.progress.passengersTransported += passengers;
    this.progress.cargoTonsDelivered += cargoTons;
    this.progress.onTimeStops += 1;
    this.progress.xp += isSmooth ? 350 : 200;
    this.checkLevelUp();
    this.save();
  }

  private checkLevelUp() {
    const requiredXp = this.progress.level * 600;
    if (this.progress.xp >= requiredXp) {
      this.progress.level += 1;
      if (this.progress.level >= 5) {
        this.progress.rank = 'Chief Loco Inspector (IR Master Driver)';
      } else if (this.progress.level >= 3) {
        this.progress.rank = 'Superfast Mail Loco Pilot';
      }
    }
  }
}

export const progressManager = new ProgressManager();
