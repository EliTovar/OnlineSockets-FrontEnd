import * as THREE from 'three';

export function createRayLine(color = 0xff0000) {
  const material = new THREE.LineBasicMaterial({ color });
  const points = [new THREE.Vector3(), new THREE.Vector3()];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  return line;
}
