//Optimizado 23-Julio
import { SceneManager } from './content/core/sceneManager.js';
import { OrbitControlManager } from './content/controls/OrbitControlManager.js';
import { Cube } from './content/world/Cube.js';
import { MultiplayerManager } from './MultiplayerManager.js';
import { loadCubePosition } from '/public/models/shared/position-3d-model/cube';

import { loadGLTFClouds } from './content/world/cloudring.js';
import { loadGLTFToriiGate } from './content/world/Torii-gate.js';
// import { loadGLTFBMG } from './content/world/BMG-Outdoor.js';
// import { loadGLTFCloudComp } from './content/world/cloud-comp1.js';

import { addSphereWithWaves } from './content/world/test/sphere_with_waves.js';


// Crear escena, cámara y renderer
const sceneManager = new SceneManager();
sceneManager.init();

// Controles de cámara
const controls = new OrbitControlManager(sceneManager.camera, sceneManager.renderer.domElement);

//! Cubo de entorno (mapa)
const cube = new Cube();
sceneManager.scene.add(cube.mesh);

//! Nubes Ring
let cloudModel = null;
loadGLTFClouds(sceneManager.scene, (clouds) => {
  cloudModel = clouds;
});

//! Japanese Torii gate
loadGLTFToriiGate(sceneManager.scene, (toriiGate) => {
});

//! Publish BMG
// loadGLTFBMG(sceneManager.scene, (bmgOutdoor) => {
//   console.log("📌 Modelo Torii agregado a la escena:", bmgOutdoor);
// });


//! ==== PRUEBAS =====

//! Esfera con olas
const waterSphere = addSphereWithWaves(sceneManager.scene, sceneManager.camera, sceneManager.renderer);


// Instanciar sistema multijugador
const multiplayer = new MultiplayerManager(
  sceneManager.scene,
  sceneManager.camera,
  sceneManager.renderer.domElement
);

// Esperar a que se cargue el personaje local
multiplayer.spawnLocalPlayer((controller, personaje) => {
  let lastTime = performance.now();

  // Cubo seguidor del personaje
  const { update: updateCube } = loadCubePosition(sceneManager.scene, personaje);

  // Callback de actualización del render loop
  let sendTimer = 0;

sceneManager.setUpdateCallback(() => {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  controls.update();
  multiplayer.update(deltaTime);
  updateCube();
  if (cloudModel?.tick) cloudModel.tick(deltaTime);
  if (waterSphere?.tick) waterSphere.tick(deltaTime);

  sendTimer += deltaTime;
  if (sendTimer >= 0.1) {
    multiplayer.sendUpdates();
    sendTimer = 0;
  }

  sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
});
})
