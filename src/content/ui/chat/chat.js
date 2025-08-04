// src/content/ui/chat/chat.js
import * as THREE from 'three';
import { GraphicEtiquetas3d } from './etiquetaChat.js';

export function setupChatLabelInput(inputElementId, scene, getLocalCharacter, getCurrentLabelRef) {
  const input = document.getElementById(inputElementId);

  input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && input.value.trim() !== '') {
    const texto = input.value.trim();
    const localCharacter = getLocalCharacter();
    if (!localCharacter) return;

    const pos = localCharacter.position.clone().add(new THREE.Vector3(0, 6, 0));

    const currentLabel = getCurrentLabelRef().value;
    if (currentLabel) {
      scene.remove(currentLabel);
    }

    const newLabel = GraphicEtiquetas3d(texto, '', pos);
    scene.add(newLabel);
    getCurrentLabelRef().value = newLabel;

    // Enviar mensaje al servidor para retransmitir a otros
    if (window.multiplayer && multiplayer.socket) {
      multiplayer.socket.emit('chat-message', { message: texto });
    }

    input.value = '';
  }
});
}
