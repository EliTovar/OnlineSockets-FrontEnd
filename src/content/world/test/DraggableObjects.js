// content/world/test/DraggableObjects.js
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function initDraggableObjects(scene, camera, controls) {
  const raycaster = new THREE.Raycaster();
  const clickMouse = new THREE.Vector2();
  const moveMouse = new THREE.Vector2();

  let isDragging = false;
  let selected = null;
  let selectedBody = null;
  let controlsWasEnabled = true;

  //! Mundo físico =============================
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0)
  });

  const timeStep = 1 / 60;

  // Arrays para relacionar mallas y cuerpos
  const physicsObjects = [];

  function addPhysicsObject(mesh, body) {
    scene.add(mesh);
    world.addBody(body);
    physicsObjects.push({ mesh, body });
  }

  // === Crear objetos ===
  function createFloor() {
    const pos = { x: 0, y: -1, z: 0 };
    const scale = { x: 70, y: 2, z: 70 };

    const floorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshPhongMaterial({ visible: false, color: 0xf9c834 })
    );
    floorMesh.position.set(pos.x, pos.y, pos.z);
    floorMesh.scale.set(scale.x, scale.y, scale.z);
    floorMesh.userData.ground = true;

    const floorBody = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(scale.x / 2, scale.y / 2, scale.z / 2)),
      type: CANNON.Body.STATIC
    });
    floorBody.position.set(pos.x, pos.y, pos.z);

    addPhysicsObject(floorMesh, floorBody);
  }

  function createBox() {
    const size = { x: 6, y: 6, z: 6 };
    const pos = { x: 15, y: size.y / 2, z: 15 };

    const boxMesh = new THREE.Mesh(
      new THREE.BoxGeometry(size.x, size.y, size.z),
      new THREE.MeshPhongMaterial({ color: 0xDC143C, wireframe: true })
    );
    boxMesh.position.set(pos.x, pos.y, pos.z);
    boxMesh.userData.draggable = true;
    boxMesh.userData.name = 'BOX';

    const boxBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)),
      position: new CANNON.Vec3(pos.x, pos.y, pos.z)
    });

    addPhysicsObject(boxMesh, boxBody);
  }

  function createSphere() {
    const radius = 4;
    const pos = { x: 15, y: radius, z: -15 };

    const sphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0x43a1f4 })
    );
    sphereMesh.position.set(pos.x, pos.y, pos.z);
    sphereMesh.userData.draggable = true;
    sphereMesh.userData.name = 'SPHERE';

    const sphereBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(radius),
      position: new CANNON.Vec3(pos.x, pos.y, pos.z)
    });

    addPhysicsObject(sphereMesh, sphereBody);
  }

  function createCylinder() {
    const radius = 4;
    const height = 6;
    const pos = { x: -15, y: height / 2, z: 15 };

    const cylinderMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, height, 32),
      new THREE.MeshPhongMaterial({ color: 0x90ee90 })
    );
    cylinderMesh.position.set(pos.x, pos.y, pos.z);
    cylinderMesh.userData.draggable = true;
    cylinderMesh.userData.name = 'CYLINDER';

    const cylinderBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Cylinder(radius, radius, height, 32),
      position: new CANNON.Vec3(pos.x, pos.y, pos.z)
    });

    addPhysicsObject(cylinderMesh, cylinderBody);
  }

  // === Listeners ===
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
        selectedBody = physicsObjects.find(o => o.mesh === selected)?.body;
        controlsWasEnabled = controls.enabled;
        controls.enabled = false;
      }
    }
  }, true);

  window.addEventListener('pointerup', () => {
    if (isDragging) {
      isDragging = false;
      selected = null;
      selectedBody = null;
      controls.enabled = controlsWasEnabled;
    }
  }, true);

  window.addEventListener('pointermove', (event) => {
    moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    moveMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }, true);

  // Función llamada en cada frame
  function tick(deltaTime) {
    // Actualizar físicas
    world.step(timeStep);

    // Si estamos arrastrando, mover el body
    if (isDragging && selected && selectedBody) {
      raycaster.setFromCamera(moveMouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      for (let intersect of intersects) {
        if (intersect.object.userData.ground) {
          selectedBody.position.x = intersect.point.x;
          selectedBody.position.z = intersect.point.z;
          selectedBody.velocity.set(0, 0, 0);
          selectedBody.angularVelocity.set(0, 0, 0);
          break;
        }
      }
    }

    // Sincronizar mallas con cuerpos físicos
    physicsObjects.forEach(({ mesh, body }) => {
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    });
  }

  // Crear objetos
  createFloor();
  createBox();
  createSphere();
  createCylinder();

  return { tick };
}
