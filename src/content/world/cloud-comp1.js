import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function loadGLTFCloudComp(scene, onLoad = () => {}) {
  const loader = new GLTFLoader();
  const modelPath = './models/world/stylize_clouds/scene.gltf';

  loader.load(
    modelPath,
    (gltf) => {
      const cloudScene = gltf.scene;
      // const axesHelper = new THREE.AxesHelper(10);
      // cloudScene.add(axesHelper);
      
      gltf.scene.scale.set(5, 5, 5); //Se hace pequeño o alto para que no sea gigante o enano.
      gltf.scene.position.set(0, 70, 0); //Lo colocamos un poco más arriba para que no se entierre en el suelo.
      gltf.scene.rotation.y += 10;

      // Reemplazar materiales en todos los meshes del modelo
      cloudScene.traverse((child) => {

        if (child.isMesh && child.material.map) {
        child.material = new THREE.MeshBasicMaterial({
          map: child.material.map
        });
      }
      });

      scene.add(cloudScene);
      onLoad(cloudScene);
    },
    undefined,
    (error) => {
      console.error('❌ Error cargando el modelo de nubes:', error);
    }
  );
}
