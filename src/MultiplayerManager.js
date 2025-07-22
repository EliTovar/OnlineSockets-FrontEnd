// src/network/MultiplayerManager.js
import { io } from 'socket.io-client';
import * as THREE from 'three';
import { loadFBXPersonaje } from './3rd_Character/character.js';
import { CharacterController } from './3rd_Character/character-controls.js';

export class MultiplayerManager {
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;

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

    this.socket.on('player-joined', (data) => {
      this.addRemotePlayer(data.id, data);
    });

    this.socket.on('player-moved', (data) => {
      const id = data.id;
      if (!this.remotePlayers[id]) return;
      this.updateRemotePlayer(id, data.position, data.rotation);
      if (data.animation && this.remotePlayers[id].controller) {
        this.remotePlayers[id].controller._changeAnimations(data.animation);
      }
    });

    this.socket.on('player-left', (id) => {
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
        controller: new CharacterController(personaje, animations, null, false)
      };

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

    if (moved || rotated || animChanged) {
      this.socket.emit('update-position', {
        position: pos.clone(),
        rotation: rot.clone(),
        animation: anim
      });

      this.lastSentPosition.copy(pos);
      this.lastSentRotationY = rot.y;
      this.lastSentAnimation = anim;
    }
  }

  update(deltaTime) {
    if (this.personajeController) {
      this.personajeController.update(deltaTime);
    }

    for (const id in this.remotePlayers) {
      const remote = this.remotePlayers[id];
      remote.controller.update(deltaTime);

      if (remote.targetPosition) {
        remote.personaje.position.lerp(remote.targetPosition, 0.1);
      }

      if (typeof remote.targetRotationY === 'number') {
        remote.personaje.rotation.y += (remote.targetRotationY - remote.personaje.rotation.y) * 0.1;
      }
    }
  }
}
