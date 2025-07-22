import * as THREE from 'three';

export class Cube {
  constructor() {
    const geometry = new THREE.BoxGeometry(50, 100, 50);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, -50, 0);
    // Posiciona el cubo para que su base esté alineada con el gridHelper (Y=0)
    
  }

  update() {
    // this.mesh.rotation.x += 0.01;
    // this.mesh.rotation.y += 0.01;
  }
}
