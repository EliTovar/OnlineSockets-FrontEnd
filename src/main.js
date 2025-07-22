
import { SceneManager } from './content/core/sceneManager.js';
import { OrbitControlManager } from './content/controls/OrbitControlManager.js';
import { Cube } from './content/world/Cube.js';
import { MultiplayerManager } from './MultiplayerManager.js';
import { loadCubePosition } from '/public/models/shared/position-3d-model/cube';

//Nuevas importaciones*
import { loadGLTFClouds } from './content/world/cloudring.js';

// Crear escena, cámara y renderer
const sceneManager = new SceneManager();
sceneManager.init();

// Controles de cámara
const controls = new OrbitControlManager(sceneManager.camera, sceneManager.renderer.domElement);

//! Cubo entorno (mapa)
const cube = new Cube();
sceneManager.scene.add(cube.mesh);


//! Nubes Ring
let cloudModel = null; // ⬅️ Declaración necesaria


loadGLTFClouds(sceneManager.scene, (clouds) => {
  cloudModel = clouds; // fuera de cualquier función (para animar)
  console.log("Nubes cargadas:", clouds);
});



// Instanciar sistema multijugador (maneja personaje local y remotos)
const multiplayer = new MultiplayerManager(
  sceneManager.scene,
  sceneManager.camera,
  sceneManager.renderer.domElement
);

// Esperar a que se cargue el personaje local
multiplayer.spawnLocalPlayer((controller, personaje) => {
  let lastTime = performance.now();

   // 🔴 Cubo seguidor
  const { cube: followerCube, update: updateCube } = loadCubePosition(sceneManager.scene, personaje);


  sceneManager.setUpdateCallback(() => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000; // en segundos
    lastTime = currentTime;

    controls.update();
    multiplayer.update(deltaTime);
    multiplayer.sendUpdates();

    updateCube(); // ✅ actualizar posición del cubo seguidor

  });

  console.log("✅ Personaje y controller listos", controller, personaje);
});



//! ====== ANIMACIONES ========

function animate () {
  requestAnimationFrame(animate);

  controls.update();
  if (cloudModel?.tick) cloudModel.tick();
  sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
}
animate();


// Enviar actualizaciones periódicas al servidor
setInterval(() => {
  multiplayer.sendUpdates();
}, 100);
