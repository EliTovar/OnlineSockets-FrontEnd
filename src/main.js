
import { SceneManager } from './content/core/sceneManager.js';
import { OrbitControlManager } from './content/controls/OrbitControlManager.js';
import { Cube } from './content/world/Cube.js';
import { MultiplayerManager } from './MultiplayerManager.js';

// Crear escena, cámara y renderer
const sceneManager = new SceneManager();
sceneManager.init();

// Controles de cámara
const controls = new OrbitControlManager(sceneManager.camera, sceneManager.renderer.domElement);

// Cubo de seguimiento o entorno
const cube = new Cube();
sceneManager.scene.add(cube.mesh);


// Instanciar sistema multijugador (maneja personaje local y remotos)
const multiplayer = new MultiplayerManager(
  sceneManager.scene,
  sceneManager.camera,
  sceneManager.renderer.domElement
);

// Esperar a que se cargue el personaje local
multiplayer.spawnLocalPlayer((controller, personaje) => {
  let lastTime = performance.now();

  sceneManager.setUpdateCallback(() => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000; // en segundos
    lastTime = currentTime;

    multiplayer.update(deltaTime);
    multiplayer.sendUpdates();
  });

  console.log("✅ Personaje y controller listos", controller, personaje);

});

// Enviar actualizaciones periódicas al servidor
setInterval(() => {
  multiplayer.sendUpdates();
}, 100);

// Ciclo de actualización
sceneManager.setUpdateCallback((deltaTime) => {
  controls.update();
  multiplayer.update(deltaTime);
});
