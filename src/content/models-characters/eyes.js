// src/content/models-characters/eyes.js
import * as THREE from 'three';

export function createEyesModel() {
  const group = new THREE.Group();

  const eyeGeometry = new THREE.SphereGeometry(0.1, 32, 32);
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const black = new THREE.MeshStandardMaterial({ color: 0x000000 });

  const leftEye = new THREE.Mesh(eyeGeometry, white);
  const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.03), black);
  leftEye.position.set(-0.1, 0, 0);
  leftPupil.position.set(-0.1, 0, 0.09);

  const rightEye = new THREE.Mesh(eyeGeometry, white);
  const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.03), black);
  rightEye.position.set(0.1, 0, 0);
  rightPupil.position.set(0.1, 0, 0.09);

  group.add(leftEye, leftPupil, rightEye, rightPupil);
  return group;
}
