// content/world/Torii-gate.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function loadNero(scene, onLoad = () => {}) {
  const loader = new GLTFLoader();

  // Usa ruta relativa como en tu ejemplo funcional
  const modelPath = './models/world/black_clover_nero/scene.gltf';

  loader.load(
    modelPath,
    (gltf) => {
      const model = gltf.scene;
      // Escala y posición opcional
      //model.scale.set(0.1, 0.1, 0.1);
      model.position.set(10, 18.5, 1.8);
      model.rotation.x += 0.5;

      // Ayudas visuales (opcional)
        // model.add(new THREE.AxesHelper(10));
        // model.add(new THREE.BoxHelper(model, 0xff0000));
            
      // Centrar el modelo y escalarlo automáticamente
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
    //   const center = box.getCenter(new THREE.Vector3());

    //   model.position.sub(center);
      model.scale.setScalar(2 / size.y);

      scene.add(model);
      console.log("✅ Nero cargado correctamente.");
      onLoad(model);
    },
    undefined,
    (error) => {
      console.error("❌ Error al cargar el modelo Torii Gate:", error);
    }
  );
}
