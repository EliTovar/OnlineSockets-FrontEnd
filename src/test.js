import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Canvas ya existe en tu HTML
const canvas = document.getElementById('experience-canvas');

// Configuración básica de escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 2, 8);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Controles de órbita
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Luz básica
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

// Carga del modelo GLTF
const loader = new GLTFLoader();
loader.load('/models/world/Cabezas/M/scene.gltf', (gltf) => {
  const model = gltf.scene;

  // Centrar y escalar el modelo
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  model.position.sub(center); // centra el modelo
  const scale = 5 / size.y;
  model.scale.setScalar(scale); // lo escala a una altura deseada de 5

  scene.add(model);
  console.log("✅ Modelo cargado correctamente.");
}, undefined, (error) => {
  console.error("❌ Error al cargar el modelo:", error);
});

// Render loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Responsive
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
