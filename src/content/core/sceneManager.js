import * as THREE from 'three';
import { OrbitControlManager } from '../controls/OrbitControlManager.js';

export class SceneManager {
  constructor() {
    const canvas = document.getElementById('experience-canvas');

    // Cámara
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    const angle = THREE.MathUtils.degToRad(50);
    const radius = 130;
    this.camera.position.set(
      Math.sin(angle) * radius,
      Math.cos(angle) * radius,
      20
    );
    this.camera.lookAt(0, -5, 0);

    // OrbitControls
    this.controls = new OrbitControlManager(this.camera, canvas);
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    // Escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeeeeee);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 7.5);
    this.scene.add(ambientLight, directionalLight);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.updateCallback = null;
    window.addEventListener('resize', () => this.onWindowResize());
  }

  init() {
    this.renderer.setAnimationLoop(this.animate.bind(this));
  }

  animate() {
    if (this.updateCallback) this.updateCallback();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  setUpdateCallback(callback) {
    this.updateCallback = callback;
  }

  update() {
    if (this.updateCallback) this.updateCallback();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
