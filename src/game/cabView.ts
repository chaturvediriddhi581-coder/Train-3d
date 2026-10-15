import * as THREE from 'three';
import { TrainType, TrainState } from '../types/game';

export class LocoPilotCabView {
  public cabGroup: THREE.Group;
  private wiperLeft: THREE.Mesh | null = null;
  private wiperRight: THREE.Mesh | null = null;
  private throttleLever: THREE.Mesh | null = null;
  private brakeLever: THREE.Mesh | null = null;
  private speedoNeedle: THREE.Mesh | null = null;
  private wiperAngle: number = 0;
  private wiperDirection: number = 1;

  constructor() {
    this.cabGroup = new THREE.Group();
    this.buildCabInterior();
  }

  private buildCabInterior() {
    // 1. Desk Console Surface
    const deskGeo = new THREE.BoxGeometry(2.4, 0.7, 1.2);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.3,
    });
    const deskMesh = new THREE.Mesh(deskGeo, deskMat);
    deskMesh.position.set(0, 1.35, 1.4);
    this.cabGroup.add(deskMesh);

    // 2. Instrument Panel Riser
    const panelGeo = new THREE.BoxGeometry(2.2, 0.45, 0.3);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
    });
    const panelMesh = new THREE.Mesh(panelGeo, panelMat);
    panelMesh.position.set(0, 1.75, 1.85);
    panelMesh.rotation.x = -0.3;
    this.cabGroup.add(panelMesh);

    // 3. Central Digital Display / KAVACH Screen
    const screenGeo = new THREE.PlaneGeometry(0.55, 0.3);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 1.78, 1.72);
    screen.rotation.x = -0.3;
    this.cabGroup.add(screen);

    // 4. Analog Speedometer Dial
    const dialGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 24);
    dialGeo.rotateX(Math.PI / 2);
    const dialMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const speedoDial = new THREE.Mesh(dialGeo, dialMat);
    speedoDial.position.set(-0.45, 1.78, 1.72);
    speedoDial.rotation.x = -0.3;
    this.cabGroup.add(speedoDial);

    // Speedometer Needle
    const needleGeo = new THREE.BoxGeometry(0.015, 0.12, 0.01);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    this.speedoNeedle = new THREE.Mesh(needleGeo, needleMat);
    this.speedoNeedle.position.set(-0.45, 1.78, 1.74);
    this.speedoNeedle.rotation.x = -0.3;
    this.cabGroup.add(this.speedoNeedle);

    // 5. Throttle Controller Lever (Notch 0 to 8)
    const leverGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
    const leverMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 });
    this.throttleLever = new THREE.Mesh(leverGeo, leverMat);
    this.throttleLever.position.set(-0.55, 1.8, 1.3);
    this.cabGroup.add(this.throttleLever);

    // 6. Train Air Brake Lever (A9 Handle)
    const brakeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.8 });
    this.brakeLever = new THREE.Mesh(leverGeo, brakeMat);
    this.brakeLever.position.set(0.55, 1.8, 1.3);
    this.cabGroup.add(this.brakeLever);

    // 7. Windshield Frame & Pillars
    const frameGeo = new THREE.BoxGeometry(2.6, 0.08, 0.1);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const topFrame = new THREE.Mesh(frameGeo, frameMat);
    topFrame.position.set(0, 2.7, 2.15);
    this.cabGroup.add(topFrame);

    // 8. Animated Windshield Wipers
    const wiperGeo = new THREE.BoxGeometry(0.025, 0.45, 0.02);
    const wiperMat = new THREE.MeshStandardMaterial({ color: 0x09090b });

    this.wiperLeft = new THREE.Mesh(wiperGeo, wiperMat);
    this.wiperLeft.position.set(-0.5, 2.3, 2.12);
    this.cabGroup.add(this.wiperLeft);

    this.wiperRight = new THREE.Mesh(wiperGeo, wiperMat);
    this.wiperRight.position.set(0.5, 2.3, 2.12);
    this.cabGroup.add(this.wiperRight);
  }

  public update(state: TrainState, dt: number) {
    // Animate throttle lever rotation based on notch
    if (this.throttleLever) {
      const notchAngle = (state.throttleNotch / 8) * -0.6;
      this.throttleLever.rotation.x = notchAngle;
    }

    // Animate brake lever
    if (this.brakeLever) {
      this.brakeLever.rotation.x = state.trainBrake * 0.7;
    }

    // Animate speedometer needle
    if (this.speedoNeedle) {
      const maxKmh = 160;
      const angle = -(state.speedKmh / maxKmh) * Math.PI * 1.3;
      this.speedoNeedle.rotation.z = angle;
    }

    // Animate wipers if active
    if (state.wipersActive && this.wiperLeft && this.wiperRight) {
      this.wiperAngle += this.wiperDirection * dt * 4.5;
      if (this.wiperAngle > 0.8) {
        this.wiperDirection = -1;
      } else if (this.wiperAngle < -0.2) {
        this.wiperDirection = 1;
      }
      this.wiperLeft.rotation.z = this.wiperAngle;
      this.wiperRight.rotation.z = this.wiperAngle;
    }
  }
}
