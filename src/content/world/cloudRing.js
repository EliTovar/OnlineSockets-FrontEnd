import * as THREE from 'three';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export function loadGLTFClouds(scene, onLoad = () => {}) {
  const loader = new GLTFLoader();
  const textureLoader = new THREE.TextureLoader();

  const basePath = "./models/world/cloud_ring/";

  const baseColorTexture = textureLoader.load(basePath + "textures/Cloud_baseColor.png");
  baseColorTexture.flipY = false;
  baseColorTexture.colorSpace = THREE.SRGBColorSpace;
  baseColorTexture.wrapS = THREE.RepeatWrapping;
  baseColorTexture.wrapT = THREE.RepeatWrapping;

  const normalTexture = textureLoader.load(basePath + "textures/Cloud_normal.png");
  normalTexture.flipY = false;
  normalTexture.wrapS = THREE.RepeatWrapping;
  normalTexture.wrapT = THREE.RepeatWrapping;


  loader.load(
    basePath + "scene.gltf",
    (gltf) => {
        const cloudModel = gltf.scene;
        const axesHelper = new THREE.AxesHelper(60);
        cloudModel.add(axesHelper);

        gltf.scene.scale.set(20, 20, 20); //Se hace pequeño o alto para que no sea gigante o enano.
        gltf.scene.position.set(0, -130, 0); //Lo colocamos un poco más arriba para que no se entierre en el suelo.

      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.map = baseColorTexture;
              mat.normalMap = normalTexture;
              mat.color = new THREE.Color(0xffffff);
              mat.needsUpdate = true;
            });
          } else if (child.material) {
            child.material.map = baseColorTexture;
            child.material.normalMap = normalTexture;
            child.material.color = new THREE.Color(0xffffff);
            child.material.needsUpdate = true;
          }
        }
      });

      //!Asignar animación
      cloudModel.tick = () => {
        cloudModel.rotation.y += 0.002; //velocidad
    };

      scene.add(gltf.scene);
      onLoad(gltf.scene);
    },
    undefined,
    (error) => {
      console.error("❌ Error cargando el modelo de nubes:", error);
    });
}
