// content/world/test/BouncingBallsManager.js
import { BouncingBallsSystem } from './BouncingBallSystem.js';

export class BouncingBallsManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.bouncingSystem = null;

    // Vincular eventos de menú
    document.querySelectorAll('.menu-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selected = e.target.dataset.value;
        if (selected === 'BouncingBalls') {
          this.toggle();
        }
      });
    });
  }

  toggle() {
    if (this.bouncingSystem) {
      this.bouncingSystem.dispose?.();
      this.bouncingSystem = null;
      console.log('BouncingBallsSystem desactivado');
    } else {
      this.bouncingSystem = new BouncingBallsSystem(
        this.sceneManager.scene,
        this.sceneManager.camera,
        this.sceneManager.renderer.domElement
      );
      console.log('BouncingBallsSystem activado');
    }
  }

  tick(deltaTime) {
    if (this.bouncingSystem?.tick) {
      this.bouncingSystem.tick(deltaTime);
    }
  }
}
