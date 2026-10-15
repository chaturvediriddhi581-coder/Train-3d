import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { 
  TrainType, 
  WeatherType, 
  CameraViewMode, 
  StationData,
  SignalAspect 
} from './types/game';
import { TrackNetwork, STATIONS } from './game/trackNetwork';
import { EnvironmentGenerator } from './game/environmentGenerator';
import { buildLocomotiveMesh, buildCoachMesh, TRAIN_CONFIGS } from './game/trainModels';
import { TrainPhysicsEngine } from './game/trainPhysics';
import { LocoPilotCabView } from './game/cabView';
import { railAudio } from './audio/railAudio';
import { progressManager } from './game/gameProgress';

// UI Components
import { TrainHUD } from './components/TrainHUD';
import { TrainSelectorModal } from './components/TrainSelectorModal';
import { WorldMapModal } from './components/WorldMapModal';
import { StationStopModal } from './components/StationStopModal';
import { CareerModal } from './components/CareerModal';
import { InstructionsModal } from './components/InstructionsModal';

// Pre-allocated reusable math vectors for zero GC in render loop
const _vec3 = new THREE.Vector3();
const _tangent = new THREE.Vector3();
const _normal = new THREE.Vector3();
const _up = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  // Game State
  const [trainType, setTrainType] = useState<TrainType>('vande_bharat');
  const [weather, setWeather] = useState<WeatherType>('day');
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('cab');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals
  const [showTrainSelector, setShowTrainSelector] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [showCareer, setShowCareer] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [currentStationStop, setCurrentStationStop] = useState<StationData | null>(null);

  // Engine references kept across re-renders
  const physicsRef = useRef<TrainPhysicsEngine | null>(null);
  const trackRef = useRef<TrackNetwork | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const trainRakeRef = useRef<THREE.Group | null>(null);
  const cabViewRef = useRef<LocoPilotCabView | null>(null);
  const rainParticlesRef = useRef<THREE.Points | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Telemetry HUD sync state
  const [hudState, setHudState] = useState({
    currentDistance: 200,
    speedKmh: 0,
    speedMs: 0,
    throttleNotch: 0,
    reverser: 1 as 1 | 0 | -1,
    trainBrake: 0,
    dynamicBrake: 0,
    emergencyBrake: false,
    headlights: 'bright' as 'off' | 'dim' | 'bright',
    cabLight: false,
    wipersActive: false,
    pantographRaised: true,
    hornActive: false,
    isWheelslipping: false,
    tractiveEffortKn: 0,
    brakePipePressureBar: 5.0,
    lineVoltageKv: 25.0,
    doorsOpen: false,
    kavachAlert: null as string | null,
  });

  const [nextSignal, setNextSignal] = useState<{ aspect: SignalAspect; targetSpeedKmh: number; distanceTo: number } | null>(null);
  const [nextStation, setNextStation] = useState<{ station: StationData; distanceTo: number } | null>(null);

  // Orbit / Mouse Camera Interaction State
  const cameraOrbit = useRef({
    yaw: 0,
    pitch: 0.15,
    distance: 28,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  // Re-build 3D Train Rake when train type changes
  const rebuildTrainRake = useCallback((newType: TrainType, scene: THREE.Scene) => {
    if (trainRakeRef.current) {
      scene.remove(trainRakeRef.current);
      trainRakeRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
    }

    const trainGroup = new THREE.Group();
    const cfg = TRAIN_CONFIGS[newType];

    // 1. Lead Locomotive / Cab Car
    const loco = buildLocomotiveMesh(newType);
    loco.position.set(0, 0, 0);
    trainGroup.add(loco);

    // 2. Trailing Coaches / Wagons
    const carSpacing = newType === 'freight_heavy' ? 17.5 : 22.5;
    for (let i = 1; i < cfg.carsCount; i++) {
      const coach = buildCoachMesh(newType, i);
      coach.position.set(0, 0, -i * carSpacing);
      trainGroup.add(coach);
    }

    scene.add(trainGroup);
    trainRakeRef.current = trainGroup;
  }, []);

  // Update Weather & Environment Lighting
  const applyWeather = useCallback((w: WeatherType, scene: THREE.Scene) => {
    if (!sunLightRef.current || !hemiLightRef.current) return;

    if (w === 'day') {
      scene.background = new THREE.Color(0x38bdf8); // Sky blue
      scene.fog = new THREE.Fog(0x38bdf8, 80, 2200);
      sunLightRef.current.color.setHex(0xfff7ed);
      sunLightRef.current.intensity = 2.2;
      sunLightRef.current.position.set(200, 350, 150);
      hemiLightRef.current.color.setHex(0xe0f2fe);
      hemiLightRef.current.groundColor.setHex(0x166534);
      hemiLightRef.current.intensity = 0.9;
      if (rainParticlesRef.current) rainParticlesRef.current.visible = false;
    } else if (w === 'sunset') {
      scene.background = new THREE.Color(0xca8a04); // Golden Indian evening
      scene.fog = new THREE.Fog(0xe11d48, 50, 1600);
      sunLightRef.current.color.setHex(0xf97316);
      sunLightRef.current.intensity = 1.8;
      sunLightRef.current.position.set(400, 80, 200);
      hemiLightRef.current.color.setHex(0xfb923c);
      hemiLightRef.current.groundColor.setHex(0x713f12);
      hemiLightRef.current.intensity = 0.7;
      if (rainParticlesRef.current) rainParticlesRef.current.visible = false;
    } else if (w === 'night') {
      scene.background = new THREE.Color(0x020617); // Starry dark night
      scene.fog = new THREE.Fog(0x020617, 30, 800);
      sunLightRef.current.color.setHex(0x38bdf8);
      sunLightRef.current.intensity = 0.35;
      sunLightRef.current.position.set(-100, 300, -100);
      hemiLightRef.current.color.setHex(0x0f172a);
      hemiLightRef.current.groundColor.setHex(0x020617);
      hemiLightRef.current.intensity = 0.25;
      if (rainParticlesRef.current) rainParticlesRef.current.visible = false;
    } else if (w === 'monsoon') {
      scene.background = new THREE.Color(0x334155); // Overcast grey
      scene.fog = new THREE.Fog(0x475569, 20, 600);
      sunLightRef.current.color.setHex(0x94a3b8);
      sunLightRef.current.intensity = 0.7;
      sunLightRef.current.position.set(0, 300, 0);
      hemiLightRef.current.color.setHex(0x64748b);
      hemiLightRef.current.groundColor.setHex(0x1e293b);
      hemiLightRef.current.intensity = 0.5;
      if (rainParticlesRef.current) rainParticlesRef.current.visible = true;
    } else if (w === 'fog') {
      scene.background = new THREE.Color(0xd4d4d8); // Thick winter fog
      scene.fog = new THREE.Fog(0xd4d4d8, 10, 180);
      sunLightRef.current.color.setHex(0xfef08a);
      sunLightRef.current.intensity = 0.8;
      sunLightRef.current.position.set(100, 200, 100);
      hemiLightRef.current.color.setHex(0xe4e4e7);
      hemiLightRef.current.groundColor.setHex(0x71717a);
      hemiLightRef.current.intensity = 0.8;
      if (rainParticlesRef.current) rainParticlesRef.current.visible = false;
    }
  }, []);

  // Three.js Mount Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Renderer, Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      8000
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Studio Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x166534, 0.9);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    sunLight.position.set(200, 350, 150);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 1200;
    sunLight.shadow.camera.left = -200;
    sunLight.shadow.camera.right = 200;
    sunLight.shadow.camera.top = 200;
    sunLight.shadow.camera.bottom = -200;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 4. Track Network & Procedural World
    const track = new TrackNetwork();
    trackRef.current = track;

    const envGenerator = new EnvironmentGenerator(scene, track);
    envGenerator.generateWorld();

    // 5. Rain Particle System
    const rainCount = 4000;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPositions[i] = (Math.random() - 0.5) * 160;
      rainPositions[i + 1] = Math.random() * 80;
      rainPositions[i + 2] = (Math.random() - 0.5) * 160;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.35,
      transparent: true,
      opacity: 0.6,
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    rainPoints.visible = false;
    scene.add(rainPoints);
    rainParticlesRef.current = rainPoints;

    // 6. Physics Engine & Initial Train Model
    const physics = new TrainPhysicsEngine(trainType, track);
    physicsRef.current = physics;

    rebuildTrainRake(trainType, scene);

    // 7. Loco Pilot 3D Cab Interior View
    const cabView = new LocoPilotCabView();
    cabViewRef.current = cabView;

    // 8. Apply Initial Weather
    applyWeather(weather, scene);

    // 9. Pre-warm shader pipeline
    renderer.compile(scene, camera);

    // 10. Pointer Drag for Free Camera Orbit & Cab Look
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      // Ignore if clicking on HUD elements
      const target = e.target as HTMLElement;
      if (target.closest('button, input, .pointer-events-auto')) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      cameraOrbit.current.isDragging = true;
      cameraOrbit.current.lastX = clientX;
      cameraOrbit.current.lastY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!cameraOrbit.current.isDragging) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const dx = clientX - cameraOrbit.current.lastX;
      const dy = clientY - cameraOrbit.current.lastY;

      cameraOrbit.current.yaw -= dx * 0.005;
      cameraOrbit.current.pitch = Math.max(-0.4, Math.min(1.2, cameraOrbit.current.pitch + dy * 0.004));

      cameraOrbit.current.lastX = clientX;
      cameraOrbit.current.lastY = clientY;
    };

    const onPointerUp = () => {
      cameraOrbit.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      cameraOrbit.current.distance = Math.max(8, Math.min(65, cameraOrbit.current.distance + e.deltaY * 0.04));
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('wheel', onWheel);

    // 11. Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 12. Main 60fps Game & Render Loop
    let animId: number;
    let lastTime = performance.now();
    let hudUpdateCounter = 0;

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      // Update Physics Engine
      physics.update(dt, weather);
      const state = physics.state;

      // Update Track Signaling and Level Crossings
      track.updateSignaling(state.currentDistance);

      // Check level crossing proximity audio
      const wrappedDist = ((state.currentDistance % track.totalLength) + track.totalLength) % track.totalLength;
      track.levelCrossings.forEach((lx) => {
        let d = Math.abs(lx.trackPosition - wrappedDist);
        if (d > track.totalLength / 2) d = track.totalLength - d;
        if (d < 180 && Math.abs(state.speedKmh) > 5) {
          railAudio.playCrossingBell();
        }
      });

      // Update 3D Train Transform along spline
      if (trainRakeRef.current) {
        const tf = track.getTransformAtDistance(state.currentDistance);
        trainRakeRef.current.position.copy(tf.point);

        // Train direction alignment
        _mat4.makeBasis(tf.normal, tf.up, tf.tangent);
        trainRakeRef.current.rotation.setFromRotationMatrix(_mat4);

        // Update Cab elements
        if (cabViewRef.current) {
          cabViewRef.current.update(state, dt);
        }
      }

      // Update Camera based on selected View Mode
      if (trainRakeRef.current && camera) {
        const trainPos = trainRakeRef.current.position;
        const tf = track.getTransformAtDistance(state.currentDistance);

        if (cameraMode === 'cab') {
          // 1st Person Loco Pilot Cab Eye Position (inside front cab)
          const isVande = trainType === 'vande_bharat';
          const cabForwardOffset = isVande ? 10.4 : 8.2;
          const eyePos = trainPos.clone()
            .addScaledVector(tf.tangent, cabForwardOffset)
            .addScaledVector(tf.up, 2.5);

          // Allow subtle mouse look in cab
          const lookDir = tf.tangent.clone()
            .applyAxisAngle(tf.up, cameraOrbit.current.yaw)
            .normalize();

          _camTarget.copy(eyePos).addScaledVector(lookDir, 50);

          camera.position.copy(eyePos);
          camera.lookAt(_camTarget);
        } else if (cameraMode === 'chase') {
          // 3rd Person Follow behind locomotive
          const followDist = 32.0;
          const followHeight = 7.5;
          const targetCamPos = trainPos.clone()
            .addScaledVector(tf.tangent, -followDist)
            .addScaledVector(tf.up, followHeight);

          // Smooth exponential damping
          camera.position.lerp(targetCamPos, 0.12);
          _camTarget.copy(trainPos).addScaledVector(tf.up, 3.0);
          camera.lookAt(_camTarget);
        } else if (cameraMode === 'orbit') {
          // Free Orbit around train
          const dist = cameraOrbit.current.distance;
          const yaw = cameraOrbit.current.yaw;
          const pitch = cameraOrbit.current.pitch;

          const cx = Math.sin(yaw) * Math.cos(pitch) * dist;
          const cy = Math.sin(pitch) * dist;
          const cz = Math.cos(yaw) * Math.cos(pitch) * dist;

          camera.position.set(trainPos.x + cx, trainPos.y + cy + 3.0, trainPos.z + cz);
          _camTarget.copy(trainPos).addScaledVector(tf.up, 2.5);
          camera.lookAt(_camTarget);
        } else if (cameraMode === 'railfan') {
          // Trackside lineside camera watching train rush by
          const offset = 8.0;
          const railfanCamPos = trainPos.clone()
            .addScaledVector(tf.normal, offset)
            .addScaledVector(tf.up, 2.2);

          camera.position.lerp(railfanCamPos, 0.05);
          _camTarget.copy(trainPos).addScaledVector(tf.up, 2.0);
          camera.lookAt(_camTarget);
        } else if (cameraMode === 'window') {
          // Passenger coach window view looking out across the landscape
          const windowPos = trainPos.clone()
            .addScaledVector(tf.tangent, -24.0)
            .addScaledVector(tf.normal, 1.45)
            .addScaledVector(tf.up, 2.4);

          camera.position.copy(windowPos);
          _camTarget.copy(windowPos).addScaledVector(tf.normal, 20.0).addScaledVector(tf.tangent, 10.0);
          camera.lookAt(_camTarget);
        } else if (cameraMode === 'top') {
          // Top-down aerial GPS overview
          camera.position.set(trainPos.x, trainPos.y + 140, trainPos.z);
          camera.lookAt(trainPos);
        }
      }

      // Animate Rain Particles during monsoon
      if (rainParticlesRef.current && rainParticlesRef.current.visible && trainRakeRef.current) {
        const positions = rainParticlesRef.current.geometry.attributes.position;
        const trainPos = trainRakeRef.current.position;
        rainParticlesRef.current.position.copy(trainPos);

        for (let i = 1; i < positions.count * 3; i += 3) {
          positions.array[i] -= 2.5; // rain fall speed
          if (positions.array[i] < -5) {
            positions.array[i] = 75;
          }
        }
        positions.needsUpdate = true;
      }

      // Sync React HUD state throttled every 4 frames for peak 60fps rendering
      hudUpdateCounter++;
      if (hudUpdateCounter % 4 === 0) {
        setHudState({ ...state });
        const nextSig = track.getNextSignal(state.currentDistance);
        if (nextSig) {
          setNextSignal({
            aspect: nextSig.signal.aspect,
            targetSpeedKmh: nextSig.signal.targetSpeedKmh,
            distanceTo: nextSig.distanceTo,
          });
        } else {
          setNextSignal(null);
        }
        setNextStation(track.getNextStation(state.currentDistance));

        // Track odometer distance driven
        if (Math.abs(state.speedKmh) > 2) {
          const deltaKm = (Math.abs(state.speedMs) * dt * 4) / 1000;
          progressManager.addDistance(deltaKm);
        }

        // Check if stopped precisely at an Indian Railway platform
        const nextSt = track.getNextStation(state.currentDistance);
        if (nextSt && nextSt.distanceTo < 60 && Math.abs(state.speedKmh) < 0.2) {
          if (!currentStationStop || currentStationStop.id !== nextSt.station.id) {
            setCurrentStationStop(nextSt.station);
          }
        }
      }

      // Render Scene
      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); // Run once on mount

  // Sync train type switch
  useEffect(() => {
    if (physicsRef.current) {
      physicsRef.current.setTrainType(trainType);
    }
    if (sceneRef.current) {
      rebuildTrainRake(trainType, sceneRef.current);
    }
  }, [trainType, rebuildTrainRake]);

  // Sync weather changes
  useEffect(() => {
    if (sceneRef.current) {
      applyWeather(weather, sceneRef.current);
    }
  }, [weather, applyWeather]);

  // Desktop Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      const physics = physicsRef.current;
      if (!physics) return;

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          physics.setThrottleNotch(physics.state.throttleNotch + 1);
          break;
        case 's':
        case 'arrowdown':
          physics.setThrottleNotch(physics.state.throttleNotch - 1);
          break;
        case 'b':
          physics.setTrainBrake(Math.min(1.0, physics.state.trainBrake + 0.2));
          break;
        case 'a':
          physics.setReverser(1);
          break;
        case 'd':
          physics.setReverser(-1);
          break;
        case ' ':
        case 'h':
          railAudio.startHorn();
          break;
        case 'x':
          physics.toggleEmergencyBrake();
          break;
        case 'l':
          physics.state.headlights = physics.state.headlights === 'off' ? 'bright' : 'off';
          break;
        case 'r':
          physics.state.wipersActive = !physics.state.wipersActive;
          break;
        case 'p':
          physics.togglePantograph();
          break;
        case 'c':
          setCameraMode((prev) => {
            const modes: CameraViewMode[] = ['cab', 'chase', 'orbit', 'railfan', 'window', 'top'];
            const nextIdx = (modes.indexOf(prev) + 1) % modes.length;
            return modes[nextIdx];
          });
          break;
        case 'm':
          setShowMap((prev) => !prev);
          break;
        case 't':
          setShowTrainSelector((prev) => !prev);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === ' ' || e.key.toLowerCase() === 'h') {
        railAudio.stopHorn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Control Handlers
  const handleThrottleChange = (notch: number) => {
    railAudio.ensureContext();
    physicsRef.current?.setThrottleNotch(notch);
  };

  const handleBrakeChange = (brake: number) => {
    railAudio.ensureContext();
    physicsRef.current?.setTrainBrake(brake);
  };

  const handleReverserChange = (rev: 1 | 0 | -1) => {
    physicsRef.current?.setReverser(rev);
  };

  const handleEmergencyBrake = () => {
    physicsRef.current?.toggleEmergencyBrake();
  };

  const handleHornStart = () => {
    railAudio.startHorn();
  };

  const handleHornStop = () => {
    railAudio.stopHorn();
  };

  const handleToggleLights = () => {
    if (physicsRef.current) {
      physicsRef.current.state.headlights =
        physicsRef.current.state.headlights === 'off' ? 'bright' : 'off';
    }
  };

  const handleToggleCabLight = () => {
    if (physicsRef.current) {
      physicsRef.current.state.cabLight = !physicsRef.current.state.cabLight;
    }
  };

  const handleToggleWipers = () => {
    if (physicsRef.current) {
      physicsRef.current.state.wipersActive = !physicsRef.current.state.wipersActive;
    }
  };

  const handleTogglePantograph = () => {
    physicsRef.current?.togglePantograph();
  };

  const handleToggleDoors = () => {
    physicsRef.current?.toggleDoors();
  };

  const handleTeleport = (distanceMeters: number) => {
    if (physicsRef.current) {
      physicsRef.current.state.currentDistance = distanceMeters;
      physicsRef.current.state.speedMs = 0;
      physicsRef.current.state.speedKmh = 0;
      physicsRef.current.state.throttleNotch = 0;
      physicsRef.current.state.trainBrake = 0.5;
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    railAudio.setMuted(nextMuted);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Primary Locomotive Pilot HUD Overlay */}
      <TrainHUD
        state={hudState}
        trainType={trainType}
        cameraMode={cameraMode}
        onSetCameraMode={setCameraMode}
        weather={weather}
        onSetWeather={setWeather}
        nextSignal={nextSignal}
        nextStation={nextStation}
        onThrottleChange={handleThrottleChange}
        onBrakeChange={handleBrakeChange}
        onReverserChange={handleReverserChange}
        onEmergencyBrake={handleEmergencyBrake}
        onHornStart={handleHornStart}
        onHornStop={handleHornStop}
        onToggleLights={handleToggleLights}
        onToggleCabLight={handleToggleCabLight}
        onToggleWipers={handleToggleWipers}
        onTogglePantograph={handleTogglePantograph}
        onToggleDoors={handleToggleDoors}
        onOpenTrainSelector={() => setShowTrainSelector(true)}
        onOpenMap={() => setShowMap(true)}
        onOpenCareer={() => setShowCareer(true)}
        onOpenHelp={() => setShowHelp(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Train Selection Modal */}
      {showTrainSelector && (
        <TrainSelectorModal
          currentTrain={trainType}
          onSelectTrain={(type) => {
            setTrainType(type);
            progressManager.save({ selectedTrain: type });
          }}
          onClose={() => setShowTrainSelector(false)}
        />
      )}

      {/* World Map & Fast Travel Modal */}
      {showMap && (
        <WorldMapModal
          currentDistance={hudState.currentDistance}
          onTeleportToDistance={handleTeleport}
          onClose={() => setShowMap(false)}
        />
      )}

      {/* Station Passenger Boarding Modal */}
      {currentStationStop && (
        <StationStopModal
          station={currentStationStop}
          trainName={TRAIN_CONFIGS[trainType].name}
          isCargoTrain={trainType === 'freight_heavy'}
          onClose={() => setCurrentStationStop(null)}
        />
      )}

      {/* Career Stats & Dossier Modal */}
      {showCareer && (
        <CareerModal onClose={() => setShowCareer(false)} />
      )}

      {/* Instructions & Controls Handbook Modal */}
      {showHelp && (
        <InstructionsModal onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
}
