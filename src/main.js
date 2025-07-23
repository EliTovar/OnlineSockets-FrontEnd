import { SceneManager } from './content/core/sceneManager.js';
import { OrbitControlManager } from './content/controls/OrbitControlManager.js';
import { Cube } from './content/world/Cube.js';
import { MultiplayerManager } from './MultiplayerManager.js';
import { loadCubePosition } from '/public/models/shared/position-3d-model/cube';

import { loadGLTFClouds } from './content/world/cloudring.js';
import { loadGLTFCloudComp } from './content/world/cloud-comp1.js';

// Crear escena, cámara y renderer
const sceneManager = new SceneManager();
sceneManager.init();

// Controles de cámara
const controls = new OrbitControlManager(sceneManager.camera, sceneManager.renderer.domElement);

// Añadir cubo de entorno (mapa)
const cube = new Cube();
sceneManager.scene.add(cube.mesh);

// Cargar nubes principales
let cloudModel = null;
loadGLTFClouds(sceneManager.scene, (clouds) => {
  cloudModel = clouds;
  console.log("Nubes cargadas:", clouds);
});

// Cargar nubes complementarias (descomenta si las necesitas)
// loadGLTFCloudComp(sceneManager.scene, (clouds) => {
//   console.log("Nubes complementarias cargadas:", clouds);
// });

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
  sceneManager.setUpdateCallback(() => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    controls.update();
    multiplayer.update(deltaTime);
    updateCube();
    if (cloudModel?.tick) cloudModel.tick();

    sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
  });

  console.log("✅ Personaje y controller listos", controller, personaje);
});

// Iniciar bucle de animación
function animate() {
  requestAnimationFrame(animate);
  sceneManager.update(); // Llama al callback registrado
}
animate();

// Enviar actualizaciones periódicas al servidor
setInterval(() => {
  multiplayer.sendUpdates();
}, 100);
