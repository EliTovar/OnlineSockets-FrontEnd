import * as THREE from 'three';

/**
 * Crea un cubo y lo agrega a la escena principal.
 * @param {THREE.Scene} scene - Escena principal
 * @param {Function} onLoad - Función callback cuando el cubo esté listo
 */



export function loadCubePosition(scene, onLoad = () => {}) {
    const renderer = new THREE.WebGLRenderer();
    renderer.setAnimationLoop( animate );

  const geometry = new THREE.BoxGeometry(0.50, 0.50, 0.50);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube1 = new THREE.Mesh(geometry, material);
  cube1.name = 'FollowerCube';
  scene.add(cube1);

  onLoad(cube1); // ✅ Aquí devolvemos el cubo creado correctamente

  //Le pongo una animación.
  function animate() {
  cube1.rotation.x += 0.01;
  cube1.rotation.y += 0.01;


}
}
