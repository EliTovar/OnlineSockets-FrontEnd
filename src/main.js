//Optimizado 23-Julio
import * as THREE from 'three';
import { SceneManager } from './content/core/sceneManager.js';
import { OrbitControlManager } from './content/controls/OrbitControlManager.js';
import { Cube } from './content/world/Cube.js';
import { MultiplayerManager } from './MultiplayerManager.js';
import { loadCubePosition } from '/public/models/shared/position-3d-model/cube';
import { setupTouchControls } from './content/ui/controlsPhone/mobileControls.js';

import { createLabelRenderer, GraphicEtiquetas3d } from './content/ui/chat/etiquetaChat.js';
import { setupChatLabelInput } from './content/ui/chat/chat.js';

import { loadGLTFToriiGate } from './content/world/Torii-gate.js';
// import { loadGLTFClouds } from './content/world/cloudring.js';
import { loadNero } from './content/world/nero.js';

import { addSphereWithWaves } from './content/world/test/sphere_with_waves.js';
import { initDraggableObjects } from './content/world/test/DraggableObjects.js';
import { BouncingBallsManager } from './content/world/test/BouncingBalls/BouncingBallsManager.js';

import { initDropdowns } from './content/ui/dropdown.js';

initDropdowns();


// Crear escena, cámara y renderer
const sceneManager = new SceneManager();
sceneManager.init();

// Controles de cámara
const controls = new OrbitControlManager(sceneManager.camera, sceneManager.renderer.domElement);

// Agrega etiqueta al presionar Enter 1
const labelRenderer = createLabelRenderer();
document.body.appendChild(labelRenderer.domElement);
let chatLabel = null;
let localCharacter = null;

// Instanciar sistema multijugador
const multiplayer = new MultiplayerManager(
  sceneManager.scene,
  sceneManager.camera,
  sceneManager.renderer.domElement
);



//! Cubo de entorno (mapa)
const cube = new Cube();
sceneManager.scene.add(cube.mesh);

//! Nubes Ring
// let cloudModel = null;
// loadGLTFClouds(sceneManager.scene, (clouds) => {
//   cloudModel = clouds;
// });

//! Japanese Torii gate
loadGLTFToriiGate(sceneManager.scene, (toriiGate) => {
});

//! Nero
loadNero(sceneManager.scene, (neroBlack) => {
});


//! ==== PRUEBAS ================================================================

//! Esfera con olas
const waterSphere = addSphereWithWaves(sceneManager.scene, sceneManager.camera, sceneManager.renderer);

//! Draggable Objects (raycaster)
const draggableSystem = initDraggableObjects(sceneManager.scene, sceneManager.camera, controls);

//! BouncingBalls
const bouncingBallsManager = new BouncingBallsManager(sceneManager);

// Esperar a que se cargue el personaje local
multiplayer.spawnLocalPlayer(async (controller, personaje) => {
  localCharacter = personaje; // ubicacion de l personaje local


  setupTouchControls(controller);    // ⬅ Conecta botones

  // Ahora sí, configurar el input del chat, pasando multiplayer
const localChatLabelRef = { label: null };

setupChatLabelInput(
  'chatInput',
  sceneManager.scene,
  () => localCharacter,
  multiplayer,
  localChatLabelRef
);



  let lastTime = performance.now();
  // Cubo seguidor del personaje
  const { update: updateCube } = loadCubePosition(sceneManager.scene, personaje);
  // Callback de actualización del render loop
  let sendTimer = 0;

sceneManager.setUpdateCallback(() => {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  if (localCharacter?.chatLabel) {
    localCharacter.chatLabel.position.copy(localCharacter.position).add(new THREE.Vector3(0, 6, 0));
  }

  bouncingBallsManager.tick(deltaTime); //BpuncingBalls


  if (draggableSystem?.tick) draggableSystem.tick();

  controls.update();
  multiplayer.update(deltaTime);
  updateCube();
  // if (cloudModel?.tick) cloudModel.tick(deltaTime);
  if (waterSphere?.tick) waterSphere.tick(deltaTime);

  sendTimer += deltaTime;
  if (sendTimer >= 0.1) {
    multiplayer.sendUpdates();
    sendTimer = 0;
  }

  sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
  labelRenderer.render(sceneManager.scene, sceneManager.camera);  // << Aquí el render de etiquetas 2D

});
})
