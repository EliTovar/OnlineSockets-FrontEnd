import * as THREE from 'three';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

const loader = new GLTFLoader();
loader.load('./models/example_model/scene.gltf', (gltf) => {
  model = gltf.scene;

  model.traverse((child) => {
    if (child.isMesh) {
      const geometry = child.geometry;
      const position = geometry.attributes.position;
      const count = position.count;

      const particleGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(count * 3);

      
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

      const particleMaterial = new THREE.PointsMaterial({
        color: 0x00ffff,
        size: 0.05,
        transparent: true,
        opacity: 0.7,
      });
      particleSystem = new THREE.Points(particleGeometry, particleMaterial);
      child.add(particleSystem); // anclar partículas al modelo
    }
  });

  scene.add(model);
  console.log("✅ Modelo cargado con partículas.");
}, undefined, (error) => {
  console.error("❌ Error al cargar el modelo:", error);
});


function animate() {
  renderer.render(scene, camera);
}

animate();
