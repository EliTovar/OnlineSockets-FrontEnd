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
  div.style.padding = '5px 10px';
  div.style.background = 'rgba(0,0,0,0.7)';
  div.style.color = 'white';
  div.style.borderRadius = '10px';
  div.style.fontSize = '14px';
  div.style.whiteSpace = 'nowrap';

  const label = new CSS2DObject(div);
  label.position.copy(position);
  return label;
}
