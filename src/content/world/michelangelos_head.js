import * as THREE from 'three';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export function loadGLTFMaleHead(scene, onLoad = () => {}) {
  const loader = new GLTFLoader();
  const basePath = "./models/world/Cabezas/M/"; // Asegúrate que aquí esté el .glb
  const modelPath = basePath + "head_of_michelangelos_david_optimised.glb";

  loader.load(
    modelPath,
    (gltf) => {
      const headModel = gltf.scene;

      // Escala y posición opcional
      headModel.scale.set(1, 1, 1);
      headModel.position.set(0, 0, 0);

      // Ayudas visuales (opcional)
      headModel.add(new THREE.AxesHelper(10));
      headModel.add(new THREE.BoxHelper(headModel, 0xff0000));

      // Conteo de meshes
      let count = 0;
      headModel.traverse((child) => {
        if (child.isMesh) {
          count++;
          child.material = new THREE.MeshNormalMaterial();
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      console.log("✅ Modelo GLB cargado. Meshes encontrados:", count);
      scene.add(headModel);
      onLoad(headModel);
    },
    undefined,
    (error) => {
      console.error("❌ Error cargando el modelo GLB:", error);
    }
  );
}
