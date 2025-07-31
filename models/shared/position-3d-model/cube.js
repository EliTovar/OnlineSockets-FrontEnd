import * as THREE from 'three';

/**
 * Crea un cubo seguidor.
 * @param {THREE.Scene} scene - Escena principal
 * @param {THREE.Object3D} targetObject - Objeto a seguir (por ejemplo, el personaje)
 * @returns {{ cube: THREE.Mesh, update: Function }}
 */
export function loadCubePosition(scene, targetObject) {
  const geometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const cube = new THREE.Mesh(geometry, material);

  scene.add(cube);

  // Función de actualización
  const update = () => {
    if (targetObject) {
      const targetPosition = new THREE.Vector3();
      targetObject.getWorldPosition(targetPosition);
      cube.position.set(targetPosition.x, targetPosition.y + 9, targetPosition.z);

      // Opcional: animación de rotación
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    }
  };

  return { cube, update };
}
