import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class OrbitControlManager extends OrbitControls {
  constructor(camera, domElement) {
    super(camera, domElement);
    this.enableDamping = true;
    this.dampingFactor = 0.05;
  }

  // Si quieres, puedes agregar métodos extra aquí
}
