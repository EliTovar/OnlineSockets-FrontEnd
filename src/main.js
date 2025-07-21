import { SceneManager } from './content/core/sceneManager.js';
import { OrbitControlManager } from './content/controls/OrbitControlManager.js';

// import { Cube } from './content/world/Cube.js';
// import { MultiplayerManager } from './network/MultiplayerManager.js';

const sceneManager = new SceneManager();
sceneManager.init();

const controls = new OrbitControlManager(sceneManager.camera, sceneManager.renderer.domElement);

const cube = new Cube();
// sceneManager.scene.add(cube.mesh);


sceneManager.scene.add(cube.mesh);

sceneManager.setUpdateCallback(() => {
  cube.update();
  controls.update(); // <== Muy importante
});