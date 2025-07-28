// sphere_with_waves.js
import * as THREE from 'three';

export function addSphereWithWaves(scene, camera, renderer) {
  const loader = new THREE.TextureLoader();
  const base = './models/world/water';

  const colorMap = loader.load(`${base}/Water_002_COLOR.jpg`);
  const normalMap = loader.load(`${base}/Water_002_NORM.jpg`);
  const displacementMap = loader.load(`${base}/Water_002_DISP.png`);
  const roughnessMap = loader.load(`${base}/Water_002_ROUGH.jpg`);
  const aoMap = loader.load(`${base}/Water_002_OCC.jpg`);

  const geometry = new THREE.SphereGeometry(6, 128, 128);
  geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));

  const material = new THREE.MeshStandardMaterial({
    map: colorMap,
    normalMap,
    displacementMap,
    displacementScale: 0.2,
    roughnessMap,
    roughness: 0.1,
    aoMap
  });

  const sphere = new THREE.Mesh(geometry, material);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  sphere.position.z = -40;
  sphere.position.y = 50;
  sphere.position.x = 20;
  sphere.rotation.x = -Math.PI / 4;
  scene.add(sphere);

  // Luz ambiental y direccional
  scene.add(new THREE.AmbientLight(0xffffff, 1.2));

  const dirLight = new THREE.DirectionalLight(0xffffff, 2);
  dirLight.position.set(20, 20, -25);
  dirLight.castShadow = true;

  const target = new THREE.Object3D();
  target.position.z = -30;
  scene.add(target);
  dirLight.target = target;
  scene.add(dirLight);

  // Animación tipo olas
  const count = geometry.attributes.position.count;
  const posArray = geometry.attributes.position.array.slice();
  const normArray = geometry.attributes.normal.array.slice();
  const damping = 0.2;

  return {
    tick: () => {
      const now = Date.now() * 0.002;
      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        const u = geometry.attributes.uv.getX(i) * Math.PI * 16;
        const v = geometry.attributes.uv.getY(i) * Math.PI * 16;
        const wave = Math.sin(u + now) + Math.cos(v + now);
        const offset = wave * damping;

        geometry.attributes.position.setX(i, posArray[ix] + normArray[ix] * offset);
        geometry.attributes.position.setY(i, posArray[iy] + normArray[iy] * offset);
        geometry.attributes.position.setZ(i, posArray[iz] + normArray[iz] * offset);
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  };
}
