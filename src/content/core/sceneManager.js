import { OrbitControlManager } from '../controls/OrbitControlManager.js';
import * as THREE from 'three';

export class SceneManager {
  constructor() {
    const canvas = document.getElementById('experience-canvas'); // Usa el canvas existente

    //! Crea la cámara
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

    

    // Posicionamiento inicial con ángulo
    const angle = THREE.MathUtils.degToRad(50); // 20 grados en radianes
    const radius = 130;

    this.camera.position.set(
      Math.sin(angle) * radius,
      Math.cos(angle) * radius,
      20
    );
    this.camera.lookAt(0, -5, 0); // Mira hacia abajo

    //! OrbitControls
    this.controls = new OrbitControlManager(this.camera, canvas);
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    this.camera.position.z = 0;

    //! Crea la escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeeeeee); // gris claro

    //* Renderizador WebGL
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    //! Agrega una grilla al piso
    const gridHelper = new THREE.GridHelper(50, 6);
    gridHelper.position.set(0, 0.01, 0);
    this.scene.add(gridHelper);

    //* Preparar actualización
    this.updateCallback = null;

    //* Evento de redimensionamiento
    window.addEventListener('resize', () => this.onWindowResize());
  }


  //! ===== METODOS de la Clase =====

  //* Inicia el bucle de animación
  init() {
    this.renderer.setAnimationLoop(this.animate.bind(this));
  }

  //* Lógica de animación
  animate() {
    if (this.updateCallback) this.updateCallback();
    this.controls.update(); // ← si quieres que el damping se aplique en cada frame
    this.renderer.render(this.scene, this.camera);
  }

  //* Registrar una función que se ejecuta cada frame
  setUpdateCallback(callback) {
    this.updateCallback = callback;
  }

  //* Ajuste de cámara y renderer al redimensionar
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
