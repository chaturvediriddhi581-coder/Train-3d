import * as THREE from 'three';
import { TrainType, TrainConfig } from '../types/game';

// Configuration registry of all available Indian Trains
export const TRAIN_CONFIGS: Record<TrainType, TrainConfig> = {
  vande_bharat: {
    id: 'vande_bharat',
    name: 'Vande Bharat Express',
    hindiName: 'वंदे भारत एक्सप्रेस (ट्रेन 18)',
    locoType: 'Aerodynamic EMU Trainset',
    category: 'High-Speed EMU',
    maxSpeedKmh: 160,
    horsepower: 12000,
    weightTons: 430,
    carsCount: 4,
    colorScheme: {
      primary: '#f8fafc',    // Pure White
      secondary: '#1d4ed8',  // Deep Ocean Blue
      accent: '#f97316',     // Saffron Orange
      roof: '#64748b',       // Sleek Grey
    },
    traction: 'Electric AC 25kV',
    description: "India's pride semi-high-speed trainset. Superb acceleration, aerodynamic front cone, regenerative braking, and panoramic sealed windows.",
    unlockedByDefault: true,
  },
  rajdhani: {
    id: 'rajdhani',
    name: 'Rajdhani Express (WAP-7)',
    hindiName: 'राजधानी एक्सप्रेस (WAP-7)',
    locoType: 'WAP-7 High-Power Electric',
    category: 'Superfast LHB',
    maxSpeedKmh: 140,
    horsepower: 6350,
    weightTons: 650,
    carsCount: 5,
    colorScheme: {
      primary: '#dc2626',    // Crimson Red
      secondary: '#fef08a',  // Cream Yellow
      accent: '#1e293b',     // Charcoal Grey
      roof: '#94a3b8',       // Brushed Silver
    },
    traction: 'Electric AC 25kV',
    description: 'The King of Indian tracks. Hauled by the 6,350 HP WAP-7 locomotive hauling German-designed stainless steel LHB coaches.',
    unlockedByDefault: true,
  },
  shatabdi: {
    id: 'shatabdi',
    name: 'Shatabdi Express',
    hindiName: 'शताब्दी एक्सप्रेस',
    locoType: 'WAP-5 / WAP-7 Electric',
    category: 'Premium Intercity',
    maxSpeedKmh: 150,
    horsepower: 6000,
    weightTons: 540,
    carsCount: 4,
    colorScheme: {
      primary: '#0284c7',    // Sky Blue
      secondary: '#1e3a8a',  // Deep Navy Blue
      accent: '#ffffff',     // Crisp White Stripe
      roof: '#64748b',       // Slate Grey
    },
    traction: 'Electric AC 25kV',
    description: 'Premier daytime express connecting major state capitals. Known for punctual runs, air-conditioned chair cars, and smooth ride quality.',
    unlockedByDefault: true,
  },
  passenger_mail: {
    id: 'passenger_mail',
    name: 'Classic Mail / Passenger (WAP-4)',
    hindiName: 'भारतीय रेल मेल / पैसेंजर (WAP-4)',
    locoType: 'WAP-4 Legendary Electric',
    category: 'Express Mail',
    maxSpeedKmh: 110,
    horsepower: 5050,
    weightTons: 750,
    carsCount: 5,
    colorScheme: {
      primary: '#1e40af',    // Classic IR Blue
      secondary: '#60a5fa',  // Sky Blue Band
      accent: '#eab308',     // Yellow Stripes
      roof: '#475569',       // Dark Steel Roof
    },
    traction: 'Electric AC 25kV',
    description: 'The quintessential Indian Railways lifeline. Hauled by the roaring red WAP-4 locomotive with classic blue ICF coaches.',
    unlockedByDefault: true,
  },
  freight_heavy: {
    id: 'freight_heavy',
    name: 'Heavy Freight / Goods (WAG-9)',
    hindiName: 'भारी मालगाड़ी (WAG-9)',
    locoType: 'WAG-9 Heavy Hauler (6000 HP)',
    category: 'Heavy Freight',
    maxSpeedKmh: 100,
    horsepower: 6120,
    weightTons: 1250,
    carsCount: 6,
    colorScheme: {
      primary: '#15803d',    // IR Freight Green
      secondary: '#ca8a04',  // Ochre Yellow Band
      accent: '#b45309',     // Rust Industrial
      roof: '#334155',       // Dark Industrial Grey
    },
    traction: 'Electric AC 25kV',
    description: 'The backbone of the Indian economy. Heavy haul 6,000 HP WAG-9 electric beast pulling high-capacity container and coal rakes.',
    unlockedByDefault: true,
  },
};

// Procedural Canvas Texture Generators for Liveries
function createVandeBharatSideTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // White base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1024, 256);

  // Deep Blue sweeping window band
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(0, 70, 1024, 90);

  // Saffron accent pinstripe
  ctx.fillStyle = '#f97316';
  ctx.fillRect(0, 64, 1024, 6);
  ctx.fillRect(0, 160, 1024, 4);

  // Windows with dark tint
  ctx.fillStyle = '#0f172a';
  for (let x = 60; x < 980; x += 90) {
    ctx.beginPath();
    ctx.roundRect(x, 76, 70, 78, 6);
    ctx.fill();
    // Inner window reflection highlight
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x + 5, 80, 20, 68);
    ctx.fillStyle = '#0f172a';
  }

  // "VANDE BHARAT" and Indian Railways logo emblem
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('VANDE BHARAT  वंदे भारत', 420, 50);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createLhbRajdhaniSideTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Crimson Red body
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(0, 0, 1024, 256);

  // Cream/Yellow central band
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(0, 75, 1024, 85);

  // Yellow trim lines
  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 70, 1024, 5);
  ctx.fillRect(0, 160, 1024, 5);

  // Windows
  ctx.fillStyle = '#0f172a';
  for (let x = 70; x < 960; x += 85) {
    ctx.beginPath();
    ctx.roundRect(x, 82, 65, 70, 4);
    ctx.fill();
  }

  // Lettering
  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 18px serif';
  ctx.fillText('INDIAN RAILWAYS  •  राजधानी एक्सप्रेस', 360, 126);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createIcfClassicBlueTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark Ultramarine Blue
  ctx.fillStyle = '#1e40af';
  ctx.fillRect(0, 0, 1024, 256);

  // Sky Blue window belt
  ctx.fillStyle = '#60a5fa';
  ctx.fillRect(0, 65, 1024, 95);

  // Double Yellow Pinstripes
  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 60, 1024, 5);
  ctx.fillRect(0, 160, 1024, 5);

  // Windows with security bars
  ctx.fillStyle = '#090d16';
  for (let x = 60; x < 980; x += 80) {
    ctx.beginPath();
    ctx.roundRect(x, 72, 60, 80, 4);
    ctx.fill();
    // IR window grill bars
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 20, 72); ctx.lineTo(x + 20, 152);
    ctx.moveTo(x + 40, 72); ctx.lineTo(x + 40, 152);
    ctx.stroke();
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('उत्तर रेलवे  NORTHERN RAILWAY', 380, 50);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Creates 3D Bogie assembly (2 axles, 4 wheels, suspension springs, brake calipers)
 */
function createBogieMesh(): THREE.Group {
  const bogieGroup = new THREE.Group();

  // Bogie Frame
  const frameGeo = new THREE.BoxGeometry(2.4, 0.25, 4.2);
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x1f242d,
    metalness: 0.85,
    roughness: 0.35,
  });
  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  frameMesh.position.y = 0.55;
  bogieGroup.add(frameMesh);

  // Axles & Steel Wheels (Broad Gauge 1.676m)
  const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.16, 24);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.95,
    roughness: 0.15,
  });

  const axleGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.0, 12);
  axleGeo.rotateZ(Math.PI / 2);

  // Two Axles per Bogie
  [-1.2, 1.2].forEach(zPos => {
    const axleMesh = new THREE.Mesh(axleGeo, frameMat);
    axleMesh.position.set(0, 0.5, zPos);
    bogieGroup.add(axleMesh);

    // Left and Right Wheels
    [-0.88, 0.88].forEach(xPos => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(xPos, 0.5, zPos);
      bogieGroup.add(wheel);
    });
  });

  return bogieGroup;
}

/**
 * Creates realistic high-voltage single/double arm Pantograph
 */
function createPantographMesh(): THREE.Group {
  const pantoGroup = new THREE.Group();
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    metalness: 0.95,
    roughness: 0.2,
  });
  const insulatorMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b, // Red ceramic insulator
    roughness: 0.4,
  });

  // Base Insulators
  const insGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 12);
  [-0.6, 0.6].forEach(x => {
    [-0.5, 0.5].forEach(z => {
      const ins = new THREE.Mesh(insGeo, insulatorMat);
      ins.position.set(x, 0.18, z);
      pantoGroup.add(ins);
    });
  });

  // Lower Articulated Arms
  const armGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8);
  const arm1 = new THREE.Mesh(armGeo, metalMat);
  arm1.position.set(0, 0.8, -0.3);
  arm1.rotation.x = Math.PI / 5;
  pantoGroup.add(arm1);

  // Upper Diamond Arms
  const arm2 = new THREE.Mesh(armGeo, metalMat);
  arm2.position.set(0, 1.45, 0.2);
  arm2.rotation.x = -Math.PI / 5;
  pantoGroup.add(arm2);

  // Collector Head / Contact Strips (Touching OHE wire at ~5.4m above ground)
  const headGeo = new THREE.BoxGeometry(2.1, 0.04, 0.15);
  const headMesh = new THREE.Mesh(headGeo, metalMat);
  headMesh.position.set(0, 1.95, 0.4);
  pantoGroup.add(headMesh);

  return pantoGroup;
}

/**
 * Builds the Locomotive / Lead Car 3D composite group
 */
export function buildLocomotiveMesh(type: TrainType): THREE.Group {
  const locoGroup = new THREE.Group();
  const cfg = TRAIN_CONFIGS[type];

  // Primary Locomotive Body
  if (type === 'vande_bharat') {
    // Aerodynamic nose shape
    const bodyGeo = new THREE.BoxGeometry(3.1, 2.9, 21.0);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.2,
      map: createVandeBharatSideTexture(),
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 2.4;
    locoGroup.add(bodyMesh);

    // Aerodynamic Sloped Nose Cone
    const noseGeo = new THREE.CylinderGeometry(0.4, 1.55, 3.8, 16);
    noseGeo.rotateX(Math.PI / 2);
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.3,
      roughness: 0.2,
    });
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.position.set(0, 2.0, 11.2);
    noseMesh.scale.set(1.0, 0.8, 1.0);
    locoGroup.add(noseMesh);

    // Dark Glazed Windshield Visor
    const windshieldGeo = new THREE.BoxGeometry(2.4, 0.9, 0.3);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.05,
      metalness: 0.9,
      transmission: 0.6,
      transparent: true,
      opacity: 0.9,
    });
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 2.65, 11.8);
    windshield.rotation.x = -0.35;
    locoGroup.add(windshield);

    // Aerodynamic Nose Saffron / Blue Stripe Accent
    const accentGeo = new THREE.BoxGeometry(2.6, 0.25, 3.0);
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
    const accentMesh = new THREE.Mesh(accentGeo, accentMat);
    accentMesh.position.set(0, 1.45, 10.8);
    locoGroup.add(accentMesh);
  } else if (type === 'rajdhani') {
    // WAP-7 Locomotive: Bold Red Front, Cream/White Band, Square Cab
    const bodyGeo = new THREE.BoxGeometry(3.15, 2.9, 18.5);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Crimson Red WAP-7
      metalness: 0.45,
      roughness: 0.3,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 2.4;
    locoGroup.add(bodyMesh);

    // Cream / Yellow Center Band
    const bandGeo = new THREE.BoxGeometry(3.18, 0.7, 18.6);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xfef08a });
    const bandMesh = new THREE.Mesh(bandGeo, bandMat);
    bandMesh.position.y = 2.3;
    locoGroup.add(bandMesh);

    // Twin Cabs (Front & Rear Cab Windshields)
    const cabGeo = new THREE.BoxGeometry(1.2, 0.75, 0.1);
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.1 });
    // Front cab windows
    [-0.7, 0.7].forEach(x => {
      const win = new THREE.Mesh(cabGeo, cabMat);
      win.position.set(x, 2.8, 9.3);
      locoGroup.add(win);
    });

    // Indian Railways Navkiran WAP-7 Front Cowcatcher / Cattle Guard
    const cowcatcherGeo = new THREE.BoxGeometry(2.8, 0.5, 0.8);
    const cowcatcherMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
    const cowcatcher = new THREE.Mesh(cowcatcherGeo, cowcatcherMat);
    cowcatcher.position.set(0, 0.5, 9.4);
    locoGroup.add(cowcatcher);

    // Buffers and Center Coupler
    [-0.9, 0.9].forEach(x => {
      const bufGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 16);
      bufGeo.rotateX(Math.PI / 2);
      const bufMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
      const buf = new THREE.Mesh(bufGeo, bufMat);
      buf.position.set(x, 0.8, 9.5);
      locoGroup.add(buf);
    });

    // Dual Roof Pantographs
    const panto1 = createPantographMesh();
    panto1.position.set(0, 3.85, 5.0);
    locoGroup.add(panto1);

    const panto2 = createPantographMesh();
    panto2.position.set(0, 3.85, -5.0);
    panto2.rotation.y = Math.PI;
    locoGroup.add(panto2);
  } else if (type === 'freight_heavy') {
    // WAG-9 Heavy Hauler: Dark Green Body, Yellow Chevron Striping
    const bodyGeo = new THREE.BoxGeometry(3.2, 3.0, 19.0);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x14532d, // Deep Freight Green
      metalness: 0.5,
      roughness: 0.35,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 2.45;
    locoGroup.add(bodyMesh);

    // Bold Yellow Tiger Chevron V-Stripe on front
    const chevronGeo = new THREE.BoxGeometry(3.25, 0.6, 0.2);
    const chevronMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
    const chevronMesh = new THREE.Mesh(chevronGeo, chevronMat);
    chevronMesh.position.set(0, 2.0, 9.55);
    locoGroup.add(chevronMesh);

    // Heavy Industrial Cowcatcher
    const cowcatcherGeo = new THREE.BoxGeometry(2.9, 0.6, 0.6);
    const cowcatcherMat = new THREE.MeshStandardMaterial({ color: 0xca8a04 });
    const cowcatcher = new THREE.Mesh(cowcatcherGeo, cowcatcherMat);
    cowcatcher.position.set(0, 0.5, 9.6);
    locoGroup.add(cowcatcher);

    // Pantographs
    const panto1 = createPantographMesh();
    panto1.position.set(0, 3.95, 5.5);
    locoGroup.add(panto1);
  } else if (type === 'passenger_mail') {
    // WAP-4 Locomotive: Classic Blood Red, Forehead Dual Headlights
    const bodyGeo = new THREE.BoxGeometry(3.1, 2.85, 18.0);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b, // Maroon/Red
      metalness: 0.4,
      roughness: 0.35,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 2.4;
    locoGroup.add(bodyMesh);

    // Characteristic WAP-4 Forehead twin-beam headlight
    const lightCaseGeo = new THREE.BoxGeometry(0.8, 0.5, 0.3);
    const lightCaseMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
    const lightCase = new THREE.Mesh(lightCaseGeo, lightCaseMat);
    lightCase.position.set(0, 3.4, 9.1);
    locoGroup.add(lightCase);

    // Pantograph
    const panto = createPantographMesh();
    panto.position.set(0, 3.85, -4.5);
    locoGroup.add(panto);
  } else {
    // Shatabdi (WAP-5 / WAP-7 in Blue)
    const bodyGeo = new THREE.BoxGeometry(3.15, 2.9, 18.5);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Sky Blue
      metalness: 0.4,
      roughness: 0.25,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 2.4;
    locoGroup.add(bodyMesh);

    // Navy & White stripes
    const bandGeo = new THREE.BoxGeometry(3.18, 0.6, 18.6);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a });
    const bandMesh = new THREE.Mesh(bandGeo, bandMat);
    bandMesh.position.y = 2.3;
    locoGroup.add(bandMesh);

    const panto = createPantographMesh();
    panto.position.set(0, 3.85, 5.0);
    locoGroup.add(panto);
  }

  // Front Headlights (Twin Sealed Beam LEDs)
  const headlightGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.15, 16);
  headlightGeo.rotateX(Math.PI / 2);
  const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });

  [-0.65, 0.65].forEach(x => {
    const hl = new THREE.Mesh(headlightGeo, headlightMat);
    hl.position.set(x, 1.9, type === 'vande_bharat' ? 12.3 : 9.35);
    locoGroup.add(hl);
  });

  // Spotlight illuminating the railway tracks ahead
  const spotLight = new THREE.SpotLight(0xfff7ed, 4.0, 180, Math.PI / 6, 0.4, 1.2);
  spotLight.position.set(0, 2.0, type === 'vande_bharat' ? 12.0 : 9.4);
  spotLight.target.position.set(0, 0, type === 'vande_bharat' ? 80.0 : 70.0);
  locoGroup.add(spotLight);
  locoGroup.add(spotLight.target);

  // Twin Bogies (Front & Rear)
  const frontBogie = createBogieMesh();
  frontBogie.position.set(0, 0, 5.5);
  locoGroup.add(frontBogie);

  const rearBogie = createBogieMesh();
  rearBogie.position.set(0, 0, -5.5);
  locoGroup.add(rearBogie);

  return locoGroup;
}

/**
 * Builds individual passenger coaches or freight wagons
 */
export function buildCoachMesh(type: TrainType, index: number): THREE.Group {
  const coachGroup = new THREE.Group();

  if (type === 'freight_heavy') {
    // Freight wagon: Alternating BCNHL Container Flatcar & BOXNHL Coal Hopper
    const isCoalHopper = index % 2 === 0;

    if (isCoalHopper) {
      // BOXNHL High-Sided Coal Hopper
      const hopperGeo = new THREE.BoxGeometry(3.1, 2.1, 15.0);
      const hopperMat = new THREE.MeshStandardMaterial({
        color: 0x78350f, // Rust Oxide
        metalness: 0.65,
        roughness: 0.6,
      });
      const hopperMesh = new THREE.Mesh(hopperGeo, hopperMat);
      hopperMesh.position.y = 2.0;
      coachGroup.add(hopperMesh);

      // Coal Cargo Heap
      const coalGeo = new THREE.ConeGeometry(1.2, 12.0, 8);
      coalGeo.rotateZ(Math.PI / 2);
      const coalMat = new THREE.MeshStandardMaterial({
        color: 0x09090b, // Glossy Black Coal
        roughness: 0.8,
      });
      const coalMesh = new THREE.Mesh(coalGeo, coalMat);
      coalMesh.position.set(0, 2.8, 0);
      coalMesh.scale.set(0.6, 1.0, 1.0);
      coachGroup.add(coalMesh);
    } else {
      // Container Wagon with twin 20ft / 40ft CONCOR freight boxes
      const flatGeo = new THREE.BoxGeometry(3.1, 0.4, 15.5);
      const flatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
      const flatMesh = new THREE.Mesh(flatGeo, flatMat);
      flatMesh.position.y = 1.1;
      coachGroup.add(flatMesh);

      // Shipping Containers (CONCOR Blue & Orange)
      const c1Geo = new THREE.BoxGeometry(2.8, 2.4, 6.8);
      const c1Mat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
      const c1 = new THREE.Mesh(c1Geo, c1Mat);
      c1.position.set(0, 2.5, 3.8);
      coachGroup.add(c1);

      const c2Mat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.4 });
      const c2 = new THREE.Mesh(c1Geo, c2Mat);
      c2.position.set(0, 2.5, -3.8);
      coachGroup.add(c2);
    }
  } else {
    // Passenger Coaches (LHB / ICF / Vande Bharat)
    const coachGeo = new THREE.BoxGeometry(3.1, 2.8, 20.0);
    let coachMat: THREE.Material;

    if (type === 'vande_bharat') {
      coachMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: createVandeBharatSideTexture(),
        roughness: 0.25,
      });
    } else if (type === 'rajdhani') {
      coachMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: createLhbRajdhaniSideTexture(),
        roughness: 0.3,
      });
    } else if (type === 'passenger_mail') {
      coachMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: createIcfClassicBlueTexture(),
        roughness: 0.35,
      });
    } else {
      // Shatabdi Sky Blue
      coachMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.3,
      });
    }

    const coachMesh = new THREE.Mesh(coachGeo, coachMat);
    coachMesh.position.y = 2.4;
    coachGroup.add(coachMesh);

    // Corrugated Roof
    const roofGeo = new THREE.CylinderGeometry(1.65, 1.65, 20.0, 16, 1, false, 0, Math.PI);
    roofGeo.rotateZ(Math.PI / 2);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.7,
      roughness: 0.3,
    });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.set(0, 3.75, 0);
    coachGroup.add(roofMesh);

    // AC Unit Pods on Roof
    [-5.0, 5.0].forEach(z => {
      const acGeo = new THREE.BoxGeometry(2.2, 0.4, 2.8);
      const acMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      const acMesh = new THREE.Mesh(acGeo, acMat);
      acMesh.position.set(0, 4.0, z);
      coachGroup.add(acMesh);
    });

    // Coach Vestibule Gangway Bellows (rubber gangway connecting coaches)
    const bellowGeo = new THREE.BoxGeometry(1.8, 2.3, 0.8);
    const bellowMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    [-10.2, 10.2].forEach(z => {
      const bellow = new THREE.Mesh(bellowGeo, bellowMat);
      bellow.position.set(0, 2.3, z);
      coachGroup.add(bellow);
    });
  }

  // Dual Bogies per coach
  const bogieOffset = type === 'freight_heavy' ? 4.8 : 6.8;
  const frontBogie = createBogieMesh();
  frontBogie.position.set(0, 0, bogieOffset);
  coachGroup.add(frontBogie);

  const rearBogie = createBogieMesh();
  rearBogie.position.set(0, 0, -bogieOffset);
  coachGroup.add(rearBogie);

  return coachGroup;
}
