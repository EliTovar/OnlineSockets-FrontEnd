import * as THREE from 'three';
import { GraphicEtiquetas3d } from './etiquetaChat.js';

export function setupChatLabelInput(inputElementId, scene, getLocalCharacter, getCurrentLabelRef, multiplayer) {
  const input = document.getElementById(inputElementId);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim() !== '') {
      const texto = input.value.trim();
      const localCharacter = getLocalCharacter();

      if (localCharacter) {
        const pos = localCharacter.position.clone().add(new THREE.Vector3(0, 6, 0));

        const currentLabel = getCurrentLabelRef().value;
        if (currentLabel) {
          scene.remove(currentLabel);
        }

        const newLabel = GraphicEtiquetas3d(texto, '', pos);
        scene.add(newLabel);
        getCurrentLabelRef().value = newLabel;

        // Emitir el mensaje al servidor vía multiplayer.socket
        if (multiplayer && multiplayer.socket) {
          multiplayer.socket.emit('chat-message', { message: texto });
        } else {
          console.warn('Multiplayer no inicializado o socket no disponible');
        }

        input.value = '';
      }
    }
  });
}
