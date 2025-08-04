import * as THREE from 'three';
import { GraphicEtiquetas3d } from './etiquetaChat.js';

export function setupChatLabelInput(inputElementId, scene, getLocalCharacter, multiplayer, labelRef) {
  const input = document.getElementById(inputElementId);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim() !== '') {
      const texto = input.value.trim();
      const localCharacter = getLocalCharacter();
      if (!localCharacter) return;

      // 🧼 Limpiar etiqueta anterior si existe
      if (labelRef.label) {
        scene.remove(labelRef.label);
      }

      // 🟢 Crear nueva etiqueta
      const pos = localCharacter.position.clone().add(new THREE.Vector3(0, 6, 0));
      const label = GraphicEtiquetas3d(texto, '', pos);
      scene.add(label);

      // 🔁 Vincular etiqueta al personaje para seguimiento
      labelRef.label = label;
      localCharacter.chatLabel = label;

      // ⏳ Eliminar después de 4 segundos
      setTimeout(() => {
        if (labelRef.label === label) {
          scene.remove(label);
          labelRef.label = null;
          localCharacter.chatLabel = null;
        }
      }, 6000);

      // 📡 Emitir mensaje al servidor
      if (multiplayer?.socket) {
        multiplayer.socket.emit('chat-message', { message: texto });
      }

      // 🧽 Limpiar input
      input.value = '';
    }
  });
}
