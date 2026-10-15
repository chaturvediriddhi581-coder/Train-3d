import * as THREE from 'three';
import { TrackNetwork, STATIONS, LEVEL_CROSSINGS } from './trackNetwork';

/**
 * Creates authentic Indian Railways Station yellow board texture
 */
function createStationBoardTexture(hindi: string, english: string, code: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  // Indian Railways iconic golden yellow background
  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 0, 512, 160);

  // Black border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 502, 150);

  // Hindi Station Name
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(hindi, 256, 52);

  // English Station Name
  ctx.font = 'bold 34px Arial, sans-serif';
  ctx.fillText(english.toUpperCase(), 256, 98);

  // Station Code & Sea Level
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText(`[ ${code} ]  •  मा.स.त. / M.S.L. +214.5M`, 256, 138);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Procedural Indian Chai Tapri / Tea Stall texture
 */
function createChaiStallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(0, 0, 256, 128);

  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('गरम चाय • CHAI & SNACKS', 128, 45);

  ctx.fillStyle = '#ffffff';
  ctx.font = '16px sans-serif';
  ctx.fillText('IRCTC APPROVED STALL', 128, 80);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class EnvironmentGenerator {
  private scene: THREE.Scene;
  private track: TrackNetwork;
  public animatedCrossings: THREE.Group[] = [];

  constructor(scene: THREE.Scene, track: TrackNetwork) {
    this.scene = scene;
    this.track = track;
  }

  public generateWorld() {
    this.buildTerrain();
    this.buildTrackRailsAndBallast();
    this.buildOHECatenarySystem();
    this.buildStations();
    this.buildBridgesAndTunnels();
    this.buildLevelCrossings();
    this.buildIndianVegetationAndFields();
    this.buildHighVoltagePylons();
  }

  /**
   * Massive open-world terrain plane with elevation variation
   */
  private buildTerrain() {
    const terrainGeo = new THREE.PlaneGeometry(16000, 16000, 64, 64);
    terrainGeo.rotateX(-Math.PI / 2);

    // Subtle natural height waves
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // River channels and low-lying plains
      const distFromCenter = Math.sqrt(x * x + z * z);
      let y = Math.sin(x * 0.002) * Math.cos(z * 0.002) * 6;
      if (z < -800 && z > -1600) {
        y = -10; // River basin
      }
      pos.setY(i, y - 1.2);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x4d7c0f, // Indian countryside lush green/olive
      roughness: 0.9,
      metalness: 0.05,
    });

    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    this.scene.add(terrain);

    // River Water Plane (Yamuna / Narmada River)
    const riverGeo = new THREE.PlaneGeometry(16000, 1000);
    riverGeo.rotateX(-Math.PI / 2);
    const riverMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85,
    });
    const riverMesh = new THREE.Mesh(riverGeo, riverMat);
    riverMesh.position.set(0, -2.5, -1100);
    this.scene.add(riverMesh);
  }

  /**
   * Builds the dual steel rails and continuous stone ballast bed along the curve
   */
  private buildTrackRailsAndBallast() {
    const samples = 1400;
    const ballastPoints: THREE.Vector3[] = [];
    const leftRailPoints: THREE.Vector3[] = [];
    const rightRailPoints: THREE.Vector3[] = [];

    const railHalfGauge = 0.838; // Broad Gauge = 1.676m

    for (let i = 0; i <= samples; i++) {
      const dist = (i / samples) * this.track.totalLength;
      const tf = this.track.getTransformAtDistance(dist);

      ballastPoints.push(tf.point.clone().addScaledVector(tf.up, -0.15));

      const leftPt = tf.point.clone().addScaledVector(tf.normal, -railHalfGauge).addScaledVector(tf.up, 0.35);
      const rightPt = tf.point.clone().addScaledVector(tf.normal, railHalfGauge).addScaledVector(tf.up, 0.35);

      leftRailPoints.push(leftPt);
      rightRailPoints.push(rightPt);
    }

    // Ballast stone bed tube
    const ballastCurve = new THREE.CatmullRomCurve3(ballastPoints, true);
    const ballastGeo = new THREE.TubeGeometry(ballastCurve, 900, 1.8, 6, true);
    const ballastMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Dark crushed granite stone
      roughness: 0.95,
      metalness: 0.1,
    });
    const ballastMesh = new THREE.Mesh(ballastGeo, ballastMat);
    this.scene.add(ballastMesh);

    // Left Steel Rail
    const leftCurve = new THREE.CatmullRomCurve3(leftRailPoints, true);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Polished steel
      roughness: 0.2,
      metalness: 0.9,
    });
    const leftRailGeo = new THREE.TubeGeometry(leftCurve, 900, 0.08, 6, true);
    const leftRailMesh = new THREE.Mesh(leftRailGeo, railMat);
    this.scene.add(leftRailMesh);

    // Right Steel Rail
    const rightCurve = new THREE.CatmullRomCurve3(rightRailPoints, true);
    const rightRailGeo = new THREE.TubeGeometry(rightCurve, 900, 0.08, 6, true);
    const rightRailMesh = new THREE.Mesh(rightRailGeo, railMat);
    this.scene.add(rightRailMesh);

    // Concrete Sleepers (every 2.5 meters using InstancedMesh for maximum 60fps performance!)
    const sleeperStep = 2.5;
    const sleeperCount = Math.floor(this.track.totalLength / sleeperStep);
    const sleeperGeo = new THREE.BoxGeometry(2.6, 0.2, 0.35);
    const sleeperMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // Prestressed concrete
      roughness: 0.85,
    });

    const sleeperInstanced = new THREE.InstancedMesh(sleeperGeo, sleeperMat, sleeperCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < sleeperCount; i++) {
      const dist = i * sleeperStep;
      const tf = this.track.getTransformAtDistance(dist);

      dummy.position.copy(tf.point).addScaledVector(tf.up, 0.1);
      
      const rotMat = new THREE.Matrix4().makeBasis(tf.normal, tf.up, tf.tangent);
      dummy.rotation.setFromRotationMatrix(rotMat);

      dummy.updateMatrix();
      sleeperInstanced.setMatrixAt(i, dummy.matrix);
    }
    sleeperInstanced.instanceMatrix.needsUpdate = true;
    sleeperInstanced.computeBoundingSphere();
    this.scene.add(sleeperInstanced);
  }

  /**
   * Overhead Electrification (OHE) Masts & 25kV Catenary Wires
   */
  private buildOHECatenarySystem() {
    const mastInterval = 55; // Mast every 55 meters
    const mastCount = Math.floor(this.track.totalLength / mastInterval);

    const mastGeo = new THREE.CylinderGeometry(0.12, 0.14, 7.5, 8);
    const armGeo = new THREE.BoxGeometry(3.6, 0.12, 0.12);
    const mastMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Galvanized steel
      metalness: 0.8,
      roughness: 0.4,
    });

    const mastGroup = new THREE.Group();

    for (let i = 0; i < mastCount; i++) {
      const dist = i * mastInterval;
      const tf = this.track.getTransformAtDistance(dist);

      // Alternating mast sides (left / right)
      const side = i % 2 === 0 ? 1 : -1;
      const mastPos = tf.point.clone().addScaledVector(tf.normal, side * 2.8);

      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.copy(mastPos).addScaledVector(tf.up, 3.5);

      // Cantilever arm extending over the track center
      const arm = new THREE.Mesh(armGeo, mastMat);
      arm.position.copy(mastPos).addScaledVector(tf.normal, -side * 1.5).addScaledVector(tf.up, 6.2);

      mastGroup.add(mast);
      mastGroup.add(arm);
    }
    this.scene.add(mastGroup);

    // Continuous 25kV Overhead Contact Wire (hanging at height 5.5m above rails)
    const oheWirePoints: THREE.Vector3[] = [];
    const wireSamples = 600;
    for (let i = 0; i <= wireSamples; i++) {
      const dist = (i / wireSamples) * this.track.totalLength;
      const tf = this.track.getTransformAtDistance(dist);
      oheWirePoints.push(tf.point.clone().addScaledVector(tf.up, 5.6));
    }
    const oheCurve = new THREE.CatmullRomCurve3(oheWirePoints, true);
    const oheWireGeo = new THREE.TubeGeometry(oheCurve, 500, 0.02, 4, true);
    const oheWireMat = new THREE.MeshBasicMaterial({ color: 0xb45309 }); // Copper contact wire
    const oheWireMesh = new THREE.Mesh(oheWireGeo, oheWireMat);
    this.scene.add(oheWireMesh);
  }

  /**
   * Builds realistic Indian Railway Stations (NDLS, Rampur, Jaipur, Mumbai CSMT, Howrah)
   */
  private buildStations() {
    STATIONS.forEach(st => {
      const tf = this.track.getTransformAtDistance(st.trackPosition);
      const stationGroup = new THREE.Group();

      // Platforms on both sides of track
      [-1, 1].forEach(side => {
        const platformWidth = 5.5;
        const platformLength = 160.0;
        const platformHeight = 1.1;

        // Platform Concrete Deck
        const platGeo = new THREE.BoxGeometry(platformWidth, platformHeight, platformLength);
        const platMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.9,
        });
        const platMesh = new THREE.Mesh(platGeo, platMat);
        platMesh.position.set(side * 4.6, platformHeight / 2, 0);
        stationGroup.add(platMesh);

        // Yellow Caution Edge Line
        const yellowLineGeo = new THREE.BoxGeometry(0.2, 0.02, platformLength);
        const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const yellowLine = new THREE.Mesh(yellowLineGeo, yellowLineMat);
        yellowLine.position.set(side * (4.6 - side * 2.2), platformHeight + 0.01, 0);
        stationGroup.add(yellowLine);

        // Corrugated Platform Shed Roof
        const roofGeo = new THREE.BoxGeometry(platformWidth + 1.0, 0.2, platformLength * 0.7);
        const roofMat = new THREE.MeshStandardMaterial({
          color: 0x0369a1, // Classic Blue IR roof
          roughness: 0.5,
        });
        const roofMesh = new THREE.Mesh(roofGeo, roofMat);
        roofMesh.position.set(side * 4.6, 5.2, 0);
        stationGroup.add(roofMesh);

        // Steel Support Columns for Roof
        for (let z = -45; z <= 45; z += 18) {
          const colGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.2, 8);
          const colMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
          const col = new THREE.Mesh(colGeo, colMat);
          col.position.set(side * 4.6, 3.1, z);
          stationGroup.add(col);
        }

        // Yellow Station Nameboards at both ends of platform
        [-65, 65].forEach(z => {
          const boardGeo = new THREE.BoxGeometry(0.1, 1.4, 4.2);
          const boardTex = createStationBoardTexture(st.hindiName, st.name, st.code);
          const boardMat = new THREE.MeshStandardMaterial({ map: boardTex });
          const board = new THREE.Mesh(boardGeo, boardMat);
          board.position.set(side * 4.6, platformHeight + 2.0, z);
          stationGroup.add(board);
        });

        // Chai Tapri & Snacks Stall
        const stallGeo = new THREE.BoxGeometry(2.4, 2.2, 3.2);
        const stallTex = createChaiStallTexture();
        const stallMat = new THREE.MeshStandardMaterial({ map: stallTex });
        const stall = new THREE.Mesh(stallGeo, stallMat);
        stall.position.set(side * 5.2, platformHeight + 1.1, 15);
        stationGroup.add(stall);

        // Station Benches ("IR")
        [-25, 0, 25].forEach(z => {
          const benchGeo = new THREE.BoxGeometry(0.6, 0.5, 2.0);
          const benchMat = new THREE.MeshStandardMaterial({ color: 0x854d0e });
          const bench = new THREE.Mesh(benchGeo, benchMat);
          bench.position.set(side * 4.6, platformHeight + 0.25, z);
          stationGroup.add(bench);
        });

        // Passengers waiting on platform
        for (let p = 0; p < 8; p++) {
          const pGroup = new THREE.Group();
          const pBodyGeo = new THREE.CylinderGeometry(0.2, 0.22, 1.3, 8);
          const colors = [0xd97706, 0x2563eb, 0xdc2626, 0x16a34a, 0x9333ea, 0xffffff];
          const pMat = new THREE.MeshStandardMaterial({ color: colors[p % colors.length] });
          const pBody = new THREE.Mesh(pBodyGeo, pMat);
          pBody.position.y = 0.65;
          pGroup.add(pBody);

          const pHeadGeo = new THREE.SphereGeometry(0.16, 8, 8);
          const pHeadMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
          const pHead = new THREE.Mesh(pHeadGeo, pHeadMat);
          pHead.position.y = 1.45;
          pGroup.add(pHead);

          pGroup.position.set(side * (4.0 + (p % 2) * 0.8), platformHeight, (p - 4) * 12 + Math.random() * 4);
          stationGroup.add(pGroup);
        }
      });

      // Foot Overbridge (FOB) connecting both platforms
      const bridgeDeckGeo = new THREE.BoxGeometry(16.0, 0.4, 3.2);
      const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.6 });
      const bridgeDeck = new THREE.Mesh(bridgeDeckGeo, bridgeMat);
      bridgeDeck.position.set(0, 6.8, -30);
      stationGroup.add(bridgeDeck);

      // Station Main Building Facade
      const bldgWidth = 32.0;
      const bldgHeight = st.sceneryType === 'metropolis' ? 16.0 : 8.0;
      const bldgColor = st.sceneryType === 'heritage' ? 0xbe123c : st.sceneryType === 'metropolis' ? 0x991b1b : 0xd97706;
      const bldgGeo = new THREE.BoxGeometry(12.0, bldgHeight, bldgWidth);
      const bldgMat = new THREE.MeshStandardMaterial({ color: bldgColor, roughness: 0.7 });
      const bldg = new THREE.Mesh(bldgGeo, bldgMat);
      bldg.position.set(14.0, bldgHeight / 2, 0);
      stationGroup.add(bldg);

      // Align station with track coordinate frame
      stationGroup.position.copy(tf.point);
      const rotMat = new THREE.Matrix4().makeBasis(tf.normal, tf.up, tf.tangent);
      stationGroup.rotation.setFromRotationMatrix(rotMat);

      this.scene.add(stationGroup);
    });
  }

  /**
   * Bridges (Narmada & Yamuna) and Western Ghats Mountain Tunnel
   */
  private buildBridgesAndTunnels() {
    // 1. Steel Truss Bridges (Yamuna Bridge at 1200m & Narmada at 8400m)
    [1200, 8400].forEach(pos => {
      const tf = this.track.getTransformAtDistance(pos);
      const bridgeGroup = new THREE.Group();

      // Steel Truss Cage
      const trussSpanLength = 180.0;
      const trussGeo = new THREE.BoxGeometry(6.5, 7.0, trussSpanLength);
      const trussMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        wireframe: true,
        roughness: 0.4,
      });
      const truss = new THREE.Mesh(trussGeo, trussMat);
      truss.position.set(0, 3.5, 0);
      bridgeGroup.add(truss);

      // Massive Concrete Piers sinking into the river
      const pierGeo = new THREE.CylinderGeometry(2.2, 3.0, 14.0, 12);
      const pierMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
      [-60, 0, 60].forEach(z => {
        const pier = new THREE.Mesh(pierGeo, pierMat);
        pier.position.set(0, -5.5, z);
        bridgeGroup.add(pier);
      });

      bridgeGroup.position.copy(tf.point);
      const rotMat = new THREE.Matrix4().makeBasis(tf.normal, tf.up, tf.tangent);
      bridgeGroup.rotation.setFromRotationMatrix(rotMat);
      this.scene.add(bridgeGroup);
    });

    // 2. Western Ghats Mountain Tunnel (at 11400m)
    const tunnelTf = this.track.getTransformAtDistance(11400);
    const tunnelGroup = new THREE.Group();

    // Mountain Rock Shell
    const mountainGeo = new THREE.ConeGeometry(90, 48, 16);
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x3f3f46, // Dark Western Ghats basalt rock
      roughness: 0.95,
    });
    const mountain = new THREE.Mesh(mountainGeo, mountainMat);
    mountain.position.set(0, 20, 0);
    tunnelGroup.add(mountain);

    // Stone Tunnel Portal Entrance
    const portalGeo = new THREE.TorusGeometry(4.5, 1.2, 8, 16, Math.PI);
    const portalMat = new THREE.MeshStandardMaterial({ color: 0x27272a });
    const portal = new THREE.Mesh(portalGeo, portalMat);
    portal.position.set(0, 0, -45);
    tunnelGroup.add(portal);

    tunnelGroup.position.copy(tunnelTf.point);
    const rotMat = new THREE.Matrix4().makeBasis(tunnelTf.normal, tunnelTf.up, tunnelTf.tangent);
    tunnelGroup.rotation.setFromRotationMatrix(rotMat);
    this.scene.add(tunnelGroup);
  }

  /**
   * Railway Level Crossings (Phatak) with working boom barriers and road vehicles
   */
  private buildLevelCrossings() {
    LEVEL_CROSSINGS.forEach(lx => {
      const tf = this.track.getTransformAtDistance(lx.trackPosition);
      const lxGroup = new THREE.Group();

      // Asphalt Road crossing perpendicular to railway track
      const roadGeo = new THREE.PlaneGeometry(12.0, 60.0);
      roadGeo.rotateX(-Math.PI / 2);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.set(0, 0.05, 0);
      lxGroup.add(road);

      // Boom Barriers on both sides
      [-1, 1].forEach(side => {
        const barrierPost = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 1.8, 8),
          new THREE.MeshStandardMaterial({ color: 0x1e293b })
        );
        barrierPost.position.set(side * 6.5, 0.9, side * 6.5);
        lxGroup.add(barrierPost);

        // Flashing Warning Light Pod
        const lightPod = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xef4444 })
        );
        lightPod.position.set(side * 6.5, 1.9, side * 6.5);
        lxGroup.add(lightPod);

        // Boom barrier pole (red and white stripes)
        const boomPivot = new THREE.Group();
        boomPivot.position.set(side * 6.5, 1.4, side * 6.5);

        const boomPole = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.12, 6.0),
          new THREE.MeshStandardMaterial({ color: 0xdc2626 })
        );
        boomPole.position.set(0, 0, side * -3.0);
        boomPivot.add(boomPole);

        lxGroup.add(boomPivot);
      });

      // Waiting Indian vehicles (Auto-rickshaw & Ambassador Car)
      const autoGeo = new THREE.BoxGeometry(1.6, 1.5, 2.6);
      const autoMat = new THREE.MeshStandardMaterial({ color: 0xca8a04 }); // Yellow/Black Auto
      const auto = new THREE.Mesh(autoGeo, autoMat);
      auto.position.set(-3.0, 0.75, 14.0);
      lxGroup.add(auto);

      const carGeo = new THREE.BoxGeometry(1.8, 1.4, 3.8);
      const carMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc }); // White taxi
      const car = new THREE.Mesh(carGeo, carMat);
      car.position.set(3.0, 0.7, -15.0);
      lxGroup.add(car);

      lxGroup.position.copy(tf.point);
      const rotMat = new THREE.Matrix4().makeBasis(tf.normal, tf.up, tf.tangent);
      lxGroup.rotation.setFromRotationMatrix(rotMat);

      this.scene.add(lxGroup);
      this.animatedCrossings.push(lxGroup);
    });
  }

  /**
   * Indian Countryside Vegetation: Mustard fields, Banyan/Neem trees, Palm trees
   */
  private buildIndianVegetationAndFields() {
    // 1. Vibrant Yellow Mustard Flower Fields near Rampur (InstancedMesh)
    const mustardCount = 200;
    const mustardGeo = new THREE.BoxGeometry(12.0, 0.4, 25.0);
    const mustardMat = new THREE.MeshStandardMaterial({
      color: 0xeab308, // Golden yellow blooms
      roughness: 0.9,
    });
    const mustardInstanced = new THREE.InstancedMesh(mustardGeo, mustardMat, mustardCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < mustardCount; i++) {
      // Place near Rampur (distance ~ 2200 to 4200m)
      const dist = 2200 + Math.random() * 2000;
      const tf = this.track.getTransformAtDistance(dist);
      const side = Math.random() > 0.5 ? 1 : -1;
      const offset = side * (18 + Math.random() * 60);

      dummy.position.copy(tf.point).addScaledVector(tf.normal, offset);
      dummy.position.y = 0.2;
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.scale.set(0.8 + Math.random() * 0.5, 1.0, 0.8 + Math.random() * 0.5);

      dummy.updateMatrix();
      mustardInstanced.setMatrixAt(i, dummy.matrix);
    }
    mustardInstanced.instanceMatrix.needsUpdate = true;
    this.scene.add(mustardInstanced);

    // 2. Trees (Banyan, Neem, and Coconut Palms)
    const treeCount = 350;
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 4.0, 8);
    const foliageGeo = new THREE.SphereGeometry(2.4, 8, 8);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x543729, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });

    const treeTrunkInstanced = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
    const treeFoliageInstanced = new THREE.InstancedMesh(foliageGeo, foliageMat, treeCount);

    for (let i = 0; i < treeCount; i++) {
      const dist = Math.random() * this.track.totalLength;
      const tf = this.track.getTransformAtDistance(dist);
      const side = Math.random() > 0.5 ? 1 : -1;
      const offset = side * (14 + Math.random() * 80);

      const treePos = tf.point.clone().addScaledVector(tf.normal, offset);
      const scale = 0.8 + Math.random() * 0.6;

      // Trunk
      dummy.position.copy(treePos);
      dummy.position.y = (4.0 * scale) / 2;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      treeTrunkInstanced.setMatrixAt(i, dummy.matrix);

      // Foliage
      dummy.position.copy(treePos);
      dummy.position.y = 4.0 * scale;
      dummy.scale.set(scale, scale * 1.2, scale);
      dummy.updateMatrix();
      treeFoliageInstanced.setMatrixAt(i, dummy.matrix);
    }

    treeTrunkInstanced.instanceMatrix.needsUpdate = true;
    treeFoliageInstanced.instanceMatrix.needsUpdate = true;
    this.scene.add(treeTrunkInstanced);
    this.scene.add(treeFoliageInstanced);
  }

  /**
   * High-Voltage 400kV Electricity Transmission Pylons across the Indian plains
   */
  private buildHighVoltagePylons() {
    const pylonCount = 20;
    const pylonGeo = new THREE.CylinderGeometry(0.8, 3.5, 32.0, 4);
    const pylonMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      wireframe: true,
      roughness: 0.5,
    });
    const pylonInstanced = new THREE.InstancedMesh(pylonGeo, pylonMat, pylonCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < pylonCount; i++) {
      const dist = i * (this.track.totalLength / pylonCount);
      const tf = this.track.getTransformAtDistance(dist);
      const side = i % 2 === 0 ? 1 : -1;

      dummy.position.copy(tf.point).addScaledVector(tf.normal, side * 120);
      dummy.position.y = 16.0;
      dummy.updateMatrix();
      pylonInstanced.setMatrixAt(i, dummy.matrix);
    }
    pylonInstanced.instanceMatrix.needsUpdate = true;
    this.scene.add(pylonInstanced);
  }
}
