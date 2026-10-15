import * as THREE from 'three';
import { StationData, LevelCrossingData, SignalData, SignalAspect } from '../types/game';

// Total track length in meters
export const TRACK_TOTAL_LENGTH = 16800;

// Authentic Indian Railway Stations along the Grand Indian Circuit
export const STATIONS: StationData[] = [
  {
    id: 'delhi',
    name: 'New Delhi Grand Central',
    hindiName: 'नई दिल्ली जंक्शन',
    code: 'NDLS',
    trackPosition: 100,
    platformsCount: 4,
    speedLimitKmh: 50,
    state: 'Delhi NCR',
    description: 'Busiest railway junction in India. Grand catenary gantries, twin footbridges, and capital skyline.',
    sceneryType: 'metropolis',
  },
  {
    id: 'rampur',
    name: 'Rampur Dehat Halt',
    hindiName: 'रामपुर देहात हॉल्ट',
    code: 'RMDH',
    trackPosition: 2800,
    platformsCount: 2,
    speedLimitKmh: 100,
    state: 'Uttar Pradesh',
    description: 'Peaceful rural village halt flanked by yellow blooming mustard fields, banyan trees, and chai tapri.',
    sceneryType: 'rural',
  },
  {
    id: 'jaipur',
    name: 'Jaipur Junction',
    hindiName: 'जयपुर जंक्शन',
    code: 'JP',
    trackPosition: 5800,
    platformsCount: 3,
    speedLimitKmh: 65,
    state: 'Rajasthan',
    description: 'The Pink City entrance. Heritage sandstone jharokhas, Aravalli rocky desert crags, and colorful station banners.',
    sceneryType: 'heritage',
  },
  {
    id: 'mumbai',
    name: 'Mumbai CSMT Coastal Terminus',
    hindiName: 'मुंबई सीएसएमटी',
    code: 'CSMT',
    trackPosition: 9800,
    platformsCount: 4,
    speedLimitKmh: 45,
    state: 'Maharashtra',
    description: 'Iconic UNESCO heritage Gothic arch terminal, Arabian sea breeze, high platforms, and suburban bustle.',
    sceneryType: 'coastal',
  },
  {
    id: 'kolkata',
    name: 'Kolkata Howrah Central',
    hindiName: 'हावड़ा जंक्शन',
    code: 'HWH',
    trackPosition: 13600,
    platformsCount: 3,
    speedLimitKmh: 60,
    state: 'West Bengal',
    description: 'Historic colossal red terminal over Hooghly river delta, lush greenery, yellow ambassador taxis.',
    sceneryType: 'metropolis',
  },
];

// Major Scenic Landmarks
export interface ScenicLandmark {
  name: string;
  hindiName: string;
  trackPosition: number;
  type: 'bridge' | 'tunnel' | 'crossing' | 'ravine';
}

export const SCENIC_LANDMARKS: ScenicLandmark[] = [
  { name: 'Yamuna River Rail Bridge', hindiName: 'यमुना रेल पुल', trackPosition: 1200, type: 'bridge' },
  { name: 'Rampur Rural Level Crossing (Phatak)', hindiName: 'रामपुर रेलवे फाटक', trackPosition: 3400, type: 'crossing' },
  { name: 'Aravalli Desert Cutting', hindiName: 'अरावली घाटी कटिंग', trackPosition: 7200, type: 'ravine' },
  { name: 'Narmada Mega Steel Truss Bridge', hindiName: 'नर्मदा महा रेल सेतु', trackPosition: 8400, type: 'bridge' },
  { name: 'Western Ghats Bhor Tunnel No. 12', hindiName: 'भोर घाट टनल', trackPosition: 11400, type: 'tunnel' },
  { name: 'Bengal Paddy Fields Level Crossing', hindiName: 'बंगाल रेलवे फाटक', trackPosition: 15200, type: 'crossing' },
];

export const LEVEL_CROSSINGS: LevelCrossingData[] = [
  { id: 'lx_rampur', trackPosition: 3400, name: 'Gate 42-A Rampur Phatak', isClosed: false, gateAngle: 0 },
  { id: 'lx_bengal', trackPosition: 15200, name: 'Gate 89-C Shantiniketan Phatak', isClosed: false, gateAngle: 0 },
];

// Helper to construct the open world track curve
function createTrackSpline(): THREE.CatmullRomCurve3 {
  // Key control points around our 16.8km Indian railway circuit
  const points = [
    // 0: Delhi Central Grand Terminal (Sprawling metropolitan tracks)
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(600, 0, -250),
    // 1: Yamuna River Steel Truss Bridge (Elevated over water)
    new THREE.Vector3(1200, 7.5, -450),
    new THREE.Vector3(1800, 7.5, -550),
    // 2: Descend into North Indian agricultural plains
    new THREE.Vector3(2400, 0.5, -300),
    // Rampur Dehat Halt (Rural village, mustard fields)
    new THREE.Vector3(2800, 0.2, 200),
    new THREE.Vector3(3400, 0.2, 700), // Level Crossing 1
    new THREE.Vector3(4200, 0.5, 1200),
    // 3: Rajasthan Desert & Jaipur Junction
    new THREE.Vector3(5000, 2.0, 1500),
    new THREE.Vector3(5800, 2.0, 1300), // Jaipur Stn
    new THREE.Vector3(6600, 3.5, 800),
    new THREE.Vector3(7200, 4.0, 100),  // Rocky Aravalli Cutting
    // 4: Narmada River Mega Steel Truss Bridge
    new THREE.Vector3(7800, 9.0, -700),
    new THREE.Vector3(8400, 9.0, -1400), // Bridge center
    new THREE.Vector3(9000, 4.0, -2000),
    // 5: Mumbai CSMT Coastal Approach
    new THREE.Vector3(9400, 1.0, -2500),
    new THREE.Vector3(9800, 0.5, -2800), // Mumbai CSMT
    new THREE.Vector3(10400, 1.0, -3100),
    // 6: Western Ghats Mountain Tunnel
    new THREE.Vector3(11000, 6.0, -2600),
    new THREE.Vector3(11400, 12.0, -2000), // Tunnel inside mountain
    new THREE.Vector3(12000, 10.0, -1300),
    new THREE.Vector3(12600, 4.0, -700),
    // 7: Bengal Plains & Kolkata Howrah
    new THREE.Vector3(13200, 1.0, -400),
    new THREE.Vector3(13600, 0.5, 100),  // Kolkata Stn
    new THREE.Vector3(14400, 0.2, 500),
    new THREE.Vector3(15200, 0.2, 400),  // Bengal Level Crossing
    new THREE.Vector3(16000, 0.2, 150),
    // Loop back into Delhi approach
    new THREE.Vector3(16500, 0.0, 50),
  ];

  const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.25);
  return curve;
}

export class TrackNetwork {
  public curve: THREE.CatmullRomCurve3;
  public totalLength: number;
  public signals: SignalData[] = [];
  public levelCrossings: LevelCrossingData[] = [...LEVEL_CROSSINGS];

  constructor() {
    this.curve = createTrackSpline();
    this.totalLength = TRACK_TOTAL_LENGTH;
    this.initializeSignals();
  }

  private initializeSignals() {
    // Automatic block signaling every 700m along the track
    const signalInterval = 700;
    const count = Math.floor(this.totalLength / signalInterval);
    for (let i = 0; i < count; i++) {
      const pos = i * signalInterval + 350;
      this.signals.push({
        id: `sig_${i}`,
        trackPosition: pos,
        aspect: 'green',
        targetSpeedKmh: 130,
      });
    }
  }

  /**
   * Evaluates dynamic railway signaling based on train position and upcoming station stops
   */
  public updateSignaling(trainDist: number) {
    const wrappedTrainDist = ((trainDist % this.totalLength) + this.totalLength) % this.totalLength;

    for (const sig of this.signals) {
      let distToSig = sig.trackPosition - wrappedTrainDist;
      if (distToSig < -100) distToSig += this.totalLength;

      // Check if this signal protects a station or level crossing
      const nextStation = STATIONS.find(st => {
        let diff = st.trackPosition - sig.trackPosition;
        if (diff < 0) diff += this.totalLength;
        return diff < 400;
      });

      if (distToSig >= 0 && distToSig < 150) {
        // Red / Caution if very close or entering platform
        if (nextStation) {
          sig.aspect = 'yellow';
          sig.targetSpeedKmh = nextStation.speedLimitKmh;
        } else {
          sig.aspect = 'green';
          sig.targetSpeedKmh = 130;
        }
      } else if (distToSig >= 150 && distToSig < 600) {
        if (nextStation) {
          sig.aspect = 'double_yellow';
          sig.targetSpeedKmh = nextStation.speedLimitKmh + 20;
        } else {
          sig.aspect = 'green';
          sig.targetSpeedKmh = 130;
        }
      } else {
        sig.aspect = 'green';
        sig.targetSpeedKmh = 130;
      }
    }

    // Update level crossings: Close gates if train is within 350m
    for (const lx of this.levelCrossings) {
      let distToLx = Math.abs(lx.trackPosition - wrappedTrainDist);
      if (distToLx > this.totalLength / 2) {
        distToLx = this.totalLength - distToLx;
      }

      if (distToLx < 350) {
        lx.isClosed = true;
        lx.gateAngle = Math.min(90, lx.gateAngle + 45 * 0.05); // animate barrier down
      } else {
        lx.isClosed = false;
        lx.gateAngle = Math.max(0, lx.gateAngle - 45 * 0.05);  // animate barrier up
      }
    }
  }

  /**
   * Retrieves full 3D transform at any distance (in meters) along the railway track
   */
  public getTransformAtDistance(distanceMeters: number) {
    const normalized = ((distanceMeters % this.totalLength) + this.totalLength) % this.totalLength;
    const u = normalized / this.totalLength;

    const point = this.curve.getPointAt(u);
    const tangent = this.curve.getTangentAt(u).normalize();
    
    // Normal vector perpendicular to tangent on XZ plane
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const up = new THREE.Vector3().crossVectors(tangent, normal).normalize();

    return {
      point,
      tangent,
      normal,
      up,
      u,
    };
  }

  /**
   * Gets the nearest upcoming signal ahead of the train
   */
  public getNextSignal(trainDist: number): { signal: SignalData; distanceTo: number } | null {
    const wrapped = ((trainDist % this.totalLength) + this.totalLength) % this.totalLength;
    let closestSig: SignalData | null = null;
    let minDistance = Infinity;

    for (const sig of this.signals) {
      let diff = sig.trackPosition - wrapped;
      if (diff < 0) diff += this.totalLength;
      if (diff < minDistance) {
        minDistance = diff;
        closestSig = sig;
      }
    }

    if (!closestSig) return null;
    return { signal: closestSig, distanceTo: minDistance };
  }

  /**
   * Gets the nearest upcoming station ahead of the train
   */
  public getNextStation(trainDist: number): { station: StationData; distanceTo: number } | null {
    const wrapped = ((trainDist % this.totalLength) + this.totalLength) % this.totalLength;
    let closestStation: StationData | null = null;
    let minDistance = Infinity;

    for (const st of STATIONS) {
      let diff = st.trackPosition - wrapped;
      if (diff < 0) diff += this.totalLength;
      if (diff < minDistance) {
        minDistance = diff;
        closestStation = st;
      }
    }

    if (!closestStation) return null;
    return { station: closestStation, distanceTo: minDistance };
  }
}
