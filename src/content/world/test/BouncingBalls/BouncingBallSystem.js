// content/world/test/BouncingBallsSystem.js
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class BouncingBallsSystem {
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;

    this.meshes = [];
    this.bodies = [];

    // Mundo físico con gravedad
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0),
    });

    // Material del piso
    this.planePhysMat = new CANNON.Material();

    // Piso físico: caja estática, tamaño 10x10, altura mínima (como en main.js)
    const halfExtents = new CANNON.Vec3(35, 35, 0.001); // mitad ancho, mitad largo y altura muy baja
    this.planeBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Box(halfExtents),
      material: this.planePhysMat,
    });
    this.planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // rotar para que quede horizontal
    this.world.addBody(this.planeBody);

    // Piso visual: plano plano 10x10 rotado para coincidir con la física
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    const groundGeo = new THREE.PlaneGeometry(10, 10);
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.receiveShadow = true;
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.scene.add(this.groundMesh);

    // Setup raycasting para detectar posición clic
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.intersectionPoint = new THREE.Vector3();

    // Plano infinito para raycasting frente a cámara (solo para detectar el clic)
    this.planeNormal = new THREE.Vector3();
    this.plane = new THREE.Plane();

    // Bindear eventos para luego poder removerlos
    this._onMouseMove = this.onMouseMove.bind(this);
    this._onClick = this.onClick.bind(this);

    this.domElement.addEventListener('mousemove', this._onMouseMove);
    this.domElement.addEventListener('click', this._onClick);
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.planeNormal.copy(this.camera.position).normalize();
    this.plane.setFromNormalAndCoplanarPoint(this.planeNormal, new THREE.Vector3(0, 0, 0));

    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.raycaster.ray.intersectPlane(this.plane, this.intersectionPoint);
  }

  onClick() {
    const radius = 1; // tamaño de la esfera como en main.js
    const sphereGeo = new THREE.SphereGeometry(radius, 40, 40);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: Math.random() * 0xffffff,
      metalness: 0,
      roughness: 0,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereMesh.castShadow = true;
    this.scene.add(sphereMesh);

    // Posición donde el raycast intersecta
    const pos = this.intersectionPoint;

    const spherePhysMat = new CANNON.Material();
    const sphereBody = new CANNON.Body({
      mass: 0.3,
      shape: new CANNON.Sphere(radius),
      position: new CANNON.Vec3(pos.x, pos.y + 1, pos.z), // se sube un poco para que caiga
      material: spherePhysMat,
    });
    this.world.addBody(sphereBody);

    // Contact material con el piso para rebote
    const contactMat = new CANNON.ContactMaterial(this.planePhysMat, spherePhysMat, {
      restitution: 0.03,
    });
    this.world.addContactMaterial(contactMat);

    this.meshes.push(sphereMesh);
    this.bodies.push(sphereBody);
  }

  tick(deltaTime) {
    this.world.step(1 / 60, deltaTime);

    // Actualizar posición y rotación de cada mesh con su cuerpo físico
    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].position.copy(this.bodies[i].position);
      this.meshes[i].quaternion.copy(this.bodies[i].quaternion);
    }

    // Sincronizar posición y rotación del mesh visual del piso con el físico
    this.groundMesh.position.copy(this.planeBody.position);
    this.groundMesh.quaternion.copy(this.planeBody.quaternion);
  }

  dispose() {
    this.domElement.removeEventListener('mousemove', this._onMouseMove);
    this.domElement.removeEventListener('click', this._onClick);

    this.meshes.forEach((mesh) => this.scene.remove(mesh));
    this.meshes = [];
    this.bodies = [];
  }
}
