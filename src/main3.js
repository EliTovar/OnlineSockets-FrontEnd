
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

//Importación y conexión del socket
import { io } from "socket.io-client";
const socket = io(import.meta.env.PROD
  ? 'https://server-onlinesockets.onrender.com'
  : 'http://localhost:3000');

//Indicator cube
import { loadCubePosition } from '/public/models/shared/position-3d-model/cube';
let followerCube; // El cubo que seguirá al personaje


//X Bot: Character-1
import { loadFBXPersonaje } from './3rd_Character/character';

//X Bot Character-1 Controls
import { CharacterController } from './3rd_Character/character-controls';


let personajeController;
const clock = new THREE.Clock(); // al inicio de tu archivo

const canvas = document.querySelector("#experience-canvas");
const sizes = {
  //Guarda el tamaño de laventana para usarlo en la camara y render.
  width: window.innerWidth,
  height: window.innerHeight,
};

//!Recibir otros jugadores y sincronizarlos ------------------
const remotePlayers = {};

const loadingPlayers = new Set();

function addRemotePlayer(id, data) {
  if (remotePlayers[id] || loadingPlayers.has(id)) return;

  loadingPlayers.add(id);
  console.log("➕ Añadiendo jugador remoto:", id, data);

  loadFBXPersonaje(scene, (personaje, animations) => {
    if (data.position) {
    personaje.position.set(data.position.x, data.position.y, data.position.z);
  }
    personaje.rotation.y = data.rotation?.y || 0;
    scene.add(personaje);

    remotePlayers[id] = {
      personaje,
      controller: new CharacterController(personaje, animations, null, null, false)// ⛔ no es jugador local
    };

    loadingPlayers.delete(id); // Ya está cargado
  });
}


// Suavizar posición en vez de copiarla directo
function updateRemotePlayer(id, position, rotation) {
  const remote = remotePlayers[id];
  if (remote) {
    remote.targetPosition = new THREE.Vector3(position.x, position.y, position.z);
    if (rotation) {
      remote.targetRotationY = rotation._y || rotation.y;
    }
  }
}


function removeRemotePlayer(id) {
  const remote = remotePlayers[id];
  if (remote) {
    scene.remove(remote.personaje);
    delete remotePlayers[id];
  }
}

//Conectar eventos con el servidor:
socket.on('current-players', (players) => {
  for (const id in players) {
    if (id !== socket.id) {
      addRemotePlayer(id, players[id]);
    }
  }
});

socket.on('player-joined', (data) => {
  addRemotePlayer(data.id, data);
});

socket.on('player-moved', (data) => {
  const id = data.id;
  if (!remotePlayers[id]) {
    console.warn(`❓ Jugador ${id} no encontrado aún, ignorando posición`);
    return;
  }
  updateRemotePlayer(id, data.position, data.rotation);

  if (data.animation && remotePlayers[id].controller) {
    remotePlayers[id].controller._changeAnimations(data.animation);
  }
  console.log('📦 Actualizando jugador remoto:', id);
});



socket.on('player-left', (id) => {
  removeRemotePlayer(id);
});



//! Loaders  ------- Para cargar Modelos y Texturas.
const textureLoader = new THREE.TextureLoader(); //Cargar imágenes que luego puedes aplicar como texturas.

//*Model Loader
const dracoLoader = new DRACOLoader(); //Cargar modelos comprimidos en formato .glb/.gltf que usen DRACO.
const basePath = import.meta.env.BASE_URL;
dracoLoader.setDecoderPath(basePath + "draco/");


const loader = new GLTFLoader(); //Carga modelos .glb o .gltf
loader.setDRACOLoader(dracoLoader); //Si el modelo esta comprimido, usa el decodificador.

//? Cambiar entre Dia y Noche.
const textureMap = { //Objeto que almacena rutas apra cambiar el entorno.
  First: {
    day: "/textures/room/day/first_texture_set_day.webp",
  }
};

const loadedTextures = { //Aquí se guardan las texturas ya cargadas, listas para usarse.
  day: {},
  night: {},
};

Object.entries(textureMap).forEach(([key, paths]) => { //Recorre el textureMap y cargas cada imagen.
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false; //Para voltear el eje Y de las texturas
  dayTexture.colorSpace = THREE.SRGBColorSpace //Para indicar a ThreeJS que la textura que estoy usando es en el espacio de color sRGB.
  loadedTextures.day[key] = dayTexture; //Cada textura se guarda en el objeto loadedTextures.

  const nightTexture = textureLoader.load(paths.night);
  nightTexture.flipY = false; //Para voltear el eje Y de las texturas
  nightTexture.colorSpace = THREE.SRGBColorSpace //(si cambia los colores)
  loadedTextures.night[key] = nightTexture;
});

const modelPath = import.meta.env.BASE_URL + 'models/Room_Portfolio.glb';
loader.load(modelPath, (gltf) => {
  scene.add(gltf.scene);
  glb.scene.traverse((child) => { //-Recorre todos los objetos dentro del modelo. -Para cada objeto (child):
    if (child.isMesh) { //Verifica si 'child' es un malla (isMesh).

      Object.entries(textureMap).forEach(([key]) => { //Esto recorre cada conjunto de texturas que se definio en textureMap: ('First', 'Second', ...).
        if (child.name.includes(key) && loadedTextures.day[key]) { // Verifica si el nombre del objeto(child.name) incluye 'First', 'Second', etc.
                                                                // Tambien asegura que la textura de día (loadedTextures.day[key]) existe y esta cargada.
            
            //? Se aplica la texura de día o noche.
          const material = new THREE.MeshBasicMaterial({ //Se crea un nuevo material basico (no necesita luces).
            map: loadedTextures.day[key], //Le aplica la textura correspondiente del mapa (loadedTextures.day[key]).
          });
          child.material = material; //Remplaza el matrial original con este nuevo.
        }
      });
    }
  });

  scene.add(glb.scene); //Se agrega el modelo a l aescena

  //? Carga de IndicatorCube ------------------------------->
  loadCubePosition(scene, (cube1) => {
  followerCube = cube1;
  console.log('✅ Cubo Indicator cargado');
  
});
  //?

  //? Carga de Personaje ------------------------------->
loadFBXPersonaje(scene, (personaje, animations) => {
  personajeController = new CharacterController(personaje, animations, camera, renderer.domElement, true);// ✅ jugador local
  console.log('✅ Modelo FBX cargado:', personaje.name);

  // Asignar posición inicial aleatoria
  const randomPosition = new THREE.Vector3(
    Math.random() * 10 - 5,
    0,
    Math.random() * 10 - 5
  );
  personaje.position.copy(randomPosition);

  socket.emit('new-player', {
    name: 'JugadorX',
    position: randomPosition,
    rotation: personaje.rotation
  });
});

  //?

});
//! Loaders ------- Fin. 


const scene = new THREE.Scene(); //Se crea la escena.

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);


const camera = new THREE.PerspectiveCamera(
  75, // campo de visión.
  sizes.width / sizes.height, //relación ancho / alto.
  0.1, //plano cercano.
  1000 //plano lejano.
);

camera.position.z = 20; //aleja la camara para ver el cubo.

//Crea un render.
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true }); //-'WebGLRenderer' tipo de render que convierte a pixeles en el canvas. -'antialias' para suavizar los bordes.
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); //'setPixelRatio' mejora la calidad visual en pantallas Retina (limitado a 2 para no abusar de la GPU).
//Crear cubo.
const geometry = new THREE.BoxGeometry(1, 1, 1); //Forma del cubo.
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); //Color sin luces.
const cube = new THREE.Mesh(geometry, material); //Une geometria + material -> objeto que puedes mostrar.
scene.add(cube); //Se agrega a la escena.

//*Controls
const controls = new OrbitControls(camera, renderer.domElement); //Controles para mause: zoom, rotar y mover ('click' derecho).
controls.enableDamping = true; //Suavizado de mivimiento.
controls.dampingFactor = 0.05; //Que tan fuerte es el frenado del movimiento.
controls.update(); //por seguridad.

//? Camara angulo
// Cámara a 10 grados alrededor del eje Y ------------ rotación de la camara
const angle = THREE.MathUtils.degToRad(20);//rota alrededor
const radius = 20;//rota

camera.position.x = Math.sin(angle) * radius;
camera.position.y = Math.cos(angle) * radius;
camera.position.z = 20; // altura (desde donde mira)

controls.target.set(0, 0, 0); // Mira al centro
controls.update(); // aplicar cambio
//?

//! Event Listeners ------- Redimensionar la ventana.
window.addEventListener("resize", () => {
  //* Update Size
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //* Update Camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //* Update Rederer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// function animate() {}

let lastSentPosition = new THREE.Vector3();
let lastSentRotationY = 0;
let lastSentAnimation = '';

setInterval(() => {
  if (personajeController && personajeController.personaje) {
    const pos = personajeController.personaje.position;
    const rot = personajeController.personaje.rotation;
    const anim = personajeController.currentAnimationName;

    const moved = pos.distanceToSquared(lastSentPosition) > 0.0001;
    const rotated = Math.abs(rot.y - lastSentRotationY) > 0.001;
    const animChanged = anim !== lastSentAnimation;

    if (moved || rotated || animChanged) {
      socket.emit('update-position', {
        position: pos.clone(),
        rotation: rot.clone(),
        animation: anim
      });

      lastSentPosition.copy(pos);
      lastSentRotationY = rot.y;
      lastSentAnimation = anim;
    }
  }
}, 100);




const render = () => {
  const deltaTime = clock.getDelta();

  if (personajeController && followerCube) {
    followerCube.position.copy(personajeController.personaje.position);
    followerCube.position.y += 10;

    personajeController.update(deltaTime);
  }

  for (const id in remotePlayers) {
    const remote = remotePlayers[id];
    remote.controller.update(deltaTime);

    if (remote.targetPosition) {
      remote.personaje.position.lerp(remote.targetPosition, 0.1);
    }

    if (typeof remote.targetRotationY === "number") {
      remote.personaje.rotation.y += (remote.targetRotationY - remote.personaje.rotation.y) * 0.1;
    }
  }

  controls.update(); // necesario si usas damping
  renderer.render(scene, camera); // <--- lo olvidaste
  requestAnimationFrame(render);  // <--- esto reinicia el bucle
};

renderer.render(scene, camera);
requestAnimationFrame(render); // inicia el bucle de animación
