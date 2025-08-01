//Optimizado 23-Julio
import * as THREE from 'three';
import { SceneManager } from './content/core/sceneManager.js';
import { OrbitControlManager } from './content/controls/OrbitControlManager.js';
import { Cube } from './content/world/Cube.js';
import { MultiplayerManager } from './MultiplayerManager.js';
import { loadCubePosition } from '/public/models/shared/position-3d-model/cube';
import { setupTouchControls } from './content/ui/controlsPhone/mobileControls.js';

import { createLabelRenderer, GraphicEtiquetas3d } from './content/ui/chat/etiquetaChat.js';


import { loadGLTFToriiGate } from './content/world/Torii-gate.js';
// import { loadGLTFClouds } from './content/world/cloudring.js';

import { addSphereWithWaves } from './content/world/test/sphere_with_waves.js';
import { initDraggableObjects } from './content/world/test/DraggableObjects.js';

const labelRenderer = createLabelRenderer();
document.body.appendChild(labelRenderer.domElement);
let chatLabel = null;
let localCharacter = null;


// Crear escena, cámara y renderer
const sceneManager = new SceneManager();
sceneManager.init();

// Controles de cámara
const controls = new OrbitControlManager(sceneManager.camera, sceneManager.renderer.domElement);

// Agrega etiqueta al presionar Enter
const input = document.getElementById('chatInput');
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && input.value.trim() !== '') {
    const texto = input.value.trim();

    if (localCharacter && localCharacter) {
      const pos = localCharacter.position.clone().add(new THREE.Vector3(0, 6, 0));

      if (chatLabel) sceneManager.scene.remove(chatLabel);

      chatLabel = GraphicEtiquetas3d(texto, '', pos);
      sceneManager.scene.add(chatLabel);

      input.value = '';
    }
  }
});



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


//! ==== PRUEBAS ================================================================

//! Esfera con olas
const waterSphere = addSphereWithWaves(sceneManager.scene, sceneManager.camera, sceneManager.renderer);

//! Draggable Objects (raycaster)
const draggableSystem = initDraggableObjects(sceneManager.scene, sceneManager.camera, controls);


// Instanciar sistema multijugador
const multiplayer = new MultiplayerManager(
  sceneManager.scene,
  sceneManager.camera,
  sceneManager.renderer.domElement
);

// Esperar a que se cargue el personaje local
multiplayer.spawnLocalPlayer(async (controller, personaje) => {
  localCharacter = personaje; // ubicacion de l personaje local


  setupTouchControls(controller);    // ⬅ Conecta botones


  let lastTime = performance.now();

  // Cubo seguidor del personaje
  const { update: updateCube } = loadCubePosition(sceneManager.scene, personaje);

  // Callback de actualización del render loop
  let sendTimer = 0;

sceneManager.setUpdateCallback(() => {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  if (chatLabel && localCharacter) {
  chatLabel.position.copy(localCharacter.position).add(new THREE.Vector3(0, 6, 0));
}



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
