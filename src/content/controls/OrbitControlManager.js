import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class OrbitControlManager extends OrbitControls {
  constructor(camera, domElement) {
    super(camera, domElement);
    this.enableDamping = true;
    this.dampingFactor = 0.05;

    // Esto bloquea que OrbitControls gire si está deshabilitado
    this.domElement.addEventListener('pointerdown', (e) => {
      if (!this.enabled) {
        e.stopImmediatePropagation();
      }
    }, true);
  }
}
