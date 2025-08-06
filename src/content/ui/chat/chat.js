import * as THREE from 'three';
import { GraphicEtiquetas3d } from './etiquetaChat.js';

export function setupChatLabelInput(inputElementId, scene, getLocalCharacter, multiplayer, labelRef) {
  const input = document.getElementById(inputElementId);

  // Aseguramos que tenga ID de mensaje inicial
  labelRef.currentMessageId = labelRef.currentMessageId || 0;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim() !== '') {
      const texto = input.value.trim();
      const localCharacter = getLocalCharacter();
      if (!localCharacter) return;

      // Incrementar ID de mensaje
      labelRef.currentMessageId++
      const myMessageId = labelRef.currentMessageId;

      // 🧼 Eliminar burbuja anterior con animación
      if (labelRef.label) {
        labelRef.label.element.classList.add('fade-out');
        setTimeout(() => {
          scene.remove(labelRef.label);
          labelRef.label = null;
        }, 500);
      }

      // 🟢 Crear nueva burbuja
      const pos = localCharacter.position.clone().add(new THREE.Vector3(0, 6, 0));
      const label = GraphicEtiquetas3d(texto, '', pos);
      scene.add(label);

      // 🔁 Asociar la burbuja al personaje
      labelRef.label = label;
      localCharacter.chatLabel = label;

      // ⏳ Auto eliminar con animación si sigue siendo la misma burbuja
      labelRef.timeoutId = setTimeout(() => {
        if (myMessageId === labelRef.currentMessageId) {
          label.element.classList.add('fade-out');
          setTimeout(() => {
            scene.remove(label);
            if (labelRef.label === label) labelRef.label = null;
            labelRef.timeoutId = null;
            localCharacter.chatLabel = null;
          }, 500);
        }
      }, 4000);

      // 📡 Emitir al servidor
      if (multiplayer?.socket) {
        multiplayer.socket.emit('chat-message', { message: texto });
      }

      // 🧽 Limpiar input y deseleccionar
      input.value = '';
      input.blur(); // 👈 esto quita el foco
    }
  });
}
