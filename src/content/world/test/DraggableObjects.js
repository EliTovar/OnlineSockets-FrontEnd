// content/world/test/DraggableObjects.js
import * as THREE from 'three';

export function initDraggableObjects(scene, camera, controls) {
  const raycaster = new THREE.Raycaster();
  const clickMouse = new THREE.Vector2();
  const moveMouse = new THREE.Vector2();

  let isDragging = false;
  let selected = null;
  let controlsWasEnabled = true;

  // === Crear objetos ===
  function createFloor() {
    const pos = { x: 0, y: -1, z: 0 };
    const scale = { x: 70, y: 2, z: 70 };
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshPhongMaterial({
        visible: false,
        color: 0xf9c834
      })
    );
    floor.position.set(pos.x, pos.y, pos.z);
    floor.scale.set(scale.x, scale.y, scale.z);
    floor.castShadow = true;
    floor.receiveShadow = true;
    floor.userData.ground = true;
    scene.add(floor);
  }

  function createBox() {
    const scale = { x: 6, y: 6, z: 6 };
    const pos = { x: 15, y: scale.y / 2, z: 15 };
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshPhongMaterial({ color: 0xDC143C })
    );
    box.position.set(pos.x, pos.y, pos.z);
    box.scale.set(scale.x, scale.y, scale.z);
    box.castShadow = true;
    box.receiveShadow = true;
    box.userData.draggable = true;
    box.userData.name = 'BOX';
    scene.add(box);
  }

  function createSphere() {
    const radius = 4;
    const pos = { x: 15, y: radius, z: -15 };
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0x43a1f4 })
    );
    sphere.position.set(pos.x, pos.y, pos.z);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.userData.draggable = true;
    sphere.userData.name = 'SPHERE';
    scene.add(sphere);
  }

  function createCylinder() {
    const radius = 4;
    const height = 6;
    const pos = { x: -15, y: height / 2, z: 15 };
    const cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, height, 32),
      new THREE.MeshPhongMaterial({ color: 0x90ee90 })
    );
    cylinder.position.set(pos.x, pos.y, pos.z);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.userData.draggable = true;
    cylinder.userData.name = 'CYLINDER';
    scene.add(cylinder);
  }

  // === Listeners ===

  // PointerDown: iniciar arrastre
  window.addEventListener('pointerdown', (event) => {
    clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(clickMouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const object = intersects[0].object;
      if (object.userData.draggable) {
        isDragging = true;
        selected = object;
        controlsWasEnabled = controls.enabled;
        controls.enabled = false;

        event.preventDefault();
        event.stopPropagation();
      }
    }
  }, true); // fase de captura

  // PointerUp: soltar objeto
  window.addEventListener('pointerup', (event) => {
    if (isDragging) {
      isDragging = false;
      selected = null;
      controls.enabled = controlsWasEnabled;

      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  // PointerMove: actualizar coordenadas del mouse
  window.addEventListener('pointermove', (event) => {
    moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    moveMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (isDragging) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  // Click (solo para depurar)
  window.addEventListener('click', (event) => {
    clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(clickMouse, camera);
    const found = raycaster.intersectObjects(scene.children, true);
    if (found.length > 0 && found[0].object.userData.draggable) {
      console.log(`✅ Clicked on: ${found[0].object.userData.name}`);
    }
  });

  // Función llamada en cada frame
  function dragObject() {
    if (!isDragging || !selected) return;
    raycaster.setFromCamera(moveMouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    for (let intersect of intersects) {
      if (intersect.object.userData.ground) {
        selected.position.x = intersect.point.x;
        selected.position.z = intersect.point.z;
        break;
      }
    }
  }

  // Crear los objetos
  createFloor();
  createBox();
  createSphere();
  createCylinder();

  // Exporta función de actualización
  return {
    tick: dragObject
  };
}
