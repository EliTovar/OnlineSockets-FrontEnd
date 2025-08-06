// src/content/models-characters/eyesPlayers.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createEyesModel(callback) {
  const loader = new GLTFLoader();
  const path = './models/shared/eyes_perspective/scene.gltf'; // Verifica ruta

  loader.load(
    path,
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(1.5, 1.5, 1.5
      ); // Ajusta según el tamaño real
      callback(model);
    },
    undefined,
    (error) => {
      console.error('❌ Error cargando modelo de ojos:', error);
      callback(null);
    }
  );
}
