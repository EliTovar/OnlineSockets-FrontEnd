// src/network/MultiplayerManager.js
import { io } from 'socket.io-client';
import * as THREE from 'three';
import { loadFBXPersonaje } from './content/models-characters/character.js';
import { CharacterController } from './content/controls/character-control.js';
import { GraphicEtiquetas3d } from './content/ui/chat/etiquetaChat.js';
import { createRayLine } from './content/ui/icon-players/createRayLine.js';
import { createEyesModel } from './content/models-characters/eyesPlayers.js'; // ⬅ Asegúrate de importar



export class MultiplayerManager {
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;

    this.localRayLine = null;
    this.localEyesModel = null;

    this.socket = io(import.meta.env.PROD
      ? 'https://server-onlinesockets.onrender.com'
      : 'http://localhost:3000');

    this.remotePlayers = {};
    this.loadingPlayers = new Set();

    this.personajeController = null;
    this.followerCube = null;

    this.lastSentPosition = new THREE.Vector3();
    this.lastSentRotationY = 0;
    this.lastSentAnimation = '';

    this.setupSocketEvents();
  }

  setupSocketEvents() {
    this.socket.on('current-players', (players) => {
      for (const id in players) {
        if (id !== this.socket.id) {
          this.addRemotePlayer(id, players[id]);
        }
      }
    });

    this.socket.on('chat-message', ({ id, message }) => {
  if (!this.remotePlayers[id]) return;

  const remoteCharacter = this.remotePlayers[id].personaje; // <-- debería ser "personaje", no "character"
  if (!remoteCharacter) return;

    // 🔄 Eliminar el anterior
  if (this.remotePlayers[id].chatLabel) {
    this.scene.remove(this.remotePlayers[id].chatLabel);
    this.remotePlayers[id].chatLabel = null;
  }

  // 🟢 Crear nueva burbuja
  const label = GraphicEtiquetas3d(message, '', remoteCharacter.position.clone().add(new THREE.Vector3(0, 6, 0)));
  this.scene.add(label);
  this.remotePlayers[id].chatLabel = label;

    // ✅ Asociar correctamente al jugador remoto
  this.remotePlayers[id].chatLabel = label;
});


    this.socket.on('player-joined', (data) => {
      this.addRemotePlayer(data.id, data);
    });

    this.socket.on('player-moved', (data) => {
      const id = data.id;

      //No actualizar a ti mismo
      if(id === this.socket.id) return;

      if (!this.remotePlayers[id]) return;
      this.updateRemotePlayer(id, data.position, data.rotation);
      if (data.animation && this.remotePlayers[id].controller) {
        this.remotePlayers[id].controller._changeAnimations(data.animation);
      }

      //Guardar rayLine para ojos del remoto
      if (data.ray) {
        this.remotePlayers[id].rayLineData = {
          origin: data.ray.origin,
          direction: data.ray.direction
        }
      }

      //mostrar rayo
      if (data.ray) {
      const remote = this.remotePlayers[data.id];
      if (!remote) return;

      if (!remote.rayLine) {
        const line = createRayLine(0x00ff00); // verde para remoto
        this.scene.add(line);
        remote.rayLine = line;
      }

      const start = new THREE.Vector3(
        data.ray.origin.x,
        data.ray.origin.y,
        data.ray.origin.z
      );

      const end = start.clone().add(
        new THREE.Vector3(
          data.ray.direction.x,
          data.ray.direction.y,
          data.ray.direction.z
        ).multiplyScalar(50)
      );

      const positions = remote.rayLine.geometry.attributes.position.array;

      positions[0] = start.x;
      positions[1] = start.y;
      positions[2] = start.z;

      positions[3] = end.x;
      positions[4] = end.y;
      positions[5] = end.z;

      remote.rayLine.geometry.attributes.position.needsUpdate = true;
    }
    });

    this.socket.on('player-left', (id) => {
      const remote = this.remotePlayers[id];
      if (remote?.rayLine) {
        this.scene.remove(remote.rayLine);
      }
      this.removeRemotePlayer(id);
    });

  }

  addRemotePlayer(id, data) {
    if (this.remotePlayers[id] || this.loadingPlayers.has(id)) return;
    this.loadingPlayers.add(id);

    loadFBXPersonaje(this.scene, (personaje, animations) => {
      personaje.position.set(data.position.x, data.position.y, data.position.z);
      personaje.rotation.y = data.rotation?.y || 0;
      this.scene.add(personaje);

      this.remotePlayers[id] = {
        personaje,
        controller: new CharacterController(personaje, animations, null, false),
        eyesModel: null,
      };

      //Cargar y añadir modelo de ojos
      createEyesModel((eyesModel) => {
        if (eyesModel) {
          eyesModel.visible = false; // Ocultar hasta que se escriba rayLineData.
          eyesModel.position.copy(personaje.position);
          this.scene.add(eyesModel);
          this.remotePlayers[id].eyesModel = eyesModel;
        }
      });

      this.loadingPlayers.delete(id);
    });
  }

  updateRemotePlayer(id, position, rotation) {
    const remote = this.remotePlayers[id];
    if (!remote) return;

    remote.targetPosition = new THREE.Vector3(position.x, position.y, position.z);
    if (rotation) remote.targetRotationY = rotation.y || rotation._y;
  }

  removeRemotePlayer(id) {
    const remote = this.remotePlayers[id];
    if (remote) {
      if (remote.chatLabel) {
        this.scene.remove(remote.chatLabel);
      }
      this.scene.remove(remote.personaje);
      delete this.remotePlayers[id];
    }
  }

  spawnLocalPlayer(callback) {
    loadFBXPersonaje(this.scene, (personaje, animations) => {
      this.personajeController = new CharacterController(personaje, animations, this.domElement, true);

      const pos = new THREE.Vector3(Math.random() * 10 - 5, 0, Math.random() * 10 - 5);
      personaje.position.copy(pos);

      this.socket.emit('new-player', {
        name: 'JugadorX',
        position: pos,
        rotation: personaje.rotation
      });

      this.localRayLine = createRayLine();
      this.scene.add(this.localRayLine);

      //Carga de modelo Ojos
      createEyesModel((eyesModel) => {
        if (eyesModel) {
          this.localEyesModel = eyesModel;
          eyesModel.visible = false; // ⛔️ Ocultar al inicio

          eyesModel.layers.set(1); // Layer 1
          this.camera.layers.enable(0); // La camara solo vea layer 0

          this.scene.add(eyesModel);
        }
      })

      callback?.(this.personajeController, personaje);
    });
  }

  sendUpdates() {
  if (!this.personajeController) return;

  const pos = this.personajeController.personaje.position;
  const rot = this.personajeController.personaje.rotation;
  const anim = this.personajeController.currentAnimationName;

  const moved = pos.distanceToSquared(this.lastSentPosition) > 0.0001;
  const rotated = Math.abs(rot.y - this.lastSentRotationY) > 0.001;
  const animChanged = anim !== this.lastSentAnimation;

  const rayOrigin = new THREE.Vector3();
  const rayDirection = new THREE.Vector3();
  this.camera.getWorldPosition(rayOrigin);
  this.camera.getWorldDirection(rayDirection);

  const payload = {
    position: pos.clone(),
    rotation: rot.clone(),
    animation: anim,
    ray: {
      origin: rayOrigin,
      direction: rayDirection
    }
  };

  if (moved || rotated || animChanged) {
    this.lastSentPosition.copy(pos);
    this.lastSentRotationY = rot.y;
    this.lastSentAnimation = anim;
  }

  // 🔁 Enviar ray siempre, aunque no se mueva
  this.socket.emit('update-position', payload);
}


  update(deltaTime) {
    if (this.personajeController) {
      this.personajeController.update(deltaTime);

      if (this.localRayLine && this.camera) {
      const origin = new THREE.Vector3();
      const direction = new THREE.Vector3();
      this.camera.getWorldPosition(origin);
      this.camera.getWorldDirection(direction);

      const end = origin.clone().add(direction.clone().multiplyScalar(50)); // Largo del rayo
      const positions = this.localRayLine.geometry.attributes.position.array;

      positions[0] = origin.x;
      positions[1] = origin.y;
      positions[2] = origin.z;

      positions[3] = end.x;
      positions[4] = end.y;
      positions[5] = end.z;

      this.localRayLine.geometry.attributes.position.needsUpdate = true;
    }
  }

  // Actualiza ojos
  if (this.localEyesModel && this.camera) {
    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3();
    this.camera.getWorldPosition(origin);
    this.camera.getWorldDirection(direction);

    // Posición frente a la cámara
    const offset = direction.clone().multiplyScalar(-2); //Distancia frente a la cámara 
    this.localEyesModel.position.copy(origin).add(offset);
    // Que mire en la dirección de la cámara
    this.localEyesModel.lookAt(origin.clone().add(direction));

    this.localEyesModel.visible = true; //Mostrar solo cuando ya está bien posicionado
  }

    for (const id in this.remotePlayers) {
      const remote = this.remotePlayers[id];
      remote.controller.update(deltaTime);

      // Posición y Rotación del personaje
      if (remote.targetPosition) {
        remote.personaje.position.lerp(remote.targetPosition, 0.1);
      }

      if (typeof remote.targetRotationY === 'number') {
        remote.personaje.rotation.y += (remote.targetRotationY - remote.personaje.rotation.y) * 0.1;
      }

      // 👁️ Actualizar modelo de ojos de remoto
      if (remote.eyesModel && remote.rayLineData) {
        remote.eyesModel.visible = true; //Solo mostrar cuando se pueda posicionar.
        const { origin, direction } = remote.rayLineData;
        const pos = new THREE.Vector3(origin.x, origin.y, origin.z);
        const dir = new THREE.Vector3(direction.x, direction.y, direction.z);
        const offset = dir.clone().multiplyScalar(2);
        remote.eyesModel.position.copy(pos).add(offset);
        remote.eyesModel.lookAt(pos.clone().add(dir));
      }

      // Actualizar posición de la etiqueta de chat del jugador remoto, si existe
      if (remote.chatLabel) {
        const offset = new THREE.Vector3(0, 6, 0);
        remote.chatLabel.position.copy(remote.personaje.position).add(offset);
      }

    }
  }
}
