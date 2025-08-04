import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export function createLabelRenderer() {
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none'; // Permite hacer clic a través del label
  return labelRenderer;
}

export function GraphicEtiquetas3d(mensaje, clase = '', position = new THREE.Vector3()) {
  const div = document.createElement('div');
  div.className = `chat-bubble ${clase}`;
  div.textContent = mensaje;

  const label = new CSS2DObject(div);
  label.position.copy(position);
  return label;
}

