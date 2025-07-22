import * as THREE from 'three';

export class Cube {
  constructor() {
    const geometry = new THREE.BoxGeometry(70, 140, 70);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, -70, 0);
    
    //! Agrega una grilla al piso
        const gridHelper = new THREE.GridHelper(70, 7);
        gridHelper.position.set(0, 70, 0);
        this.mesh.add(gridHelper);
    
  }

  update() {
    // this.mesh.rotation.x += 0.01;
    // this.mesh.rotation.y += 0.01;
  }
}
