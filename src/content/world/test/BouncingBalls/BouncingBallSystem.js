// content/world/test/BouncingBallsSystem.js
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { physicsWorld, defaultMaterial } from '../../PhysicsWorld';

export class BouncingBallsSystem {
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;

    this.meshes = [];
    this.bodies = [];

    this.world = physicsWorld; // Usar el mismo mundo

    // Material físico del piso
    this.planePhysMat = defaultMaterial;

    // Material físico de la esfera
    this.spherePhysMat = new CANNON.Material('sphereMat');

    // Piso físico: caja estática muy delgada
    const halfExtents = new CANNON.Vec3(35, 35, 0.001);
    this.planeBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Box(halfExtents),
      material: this.planePhysMat,
    });
    this.planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(this.planeBody);

    // Piso visual
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    const groundGeo = new THREE.PlaneGeometry(10, 10);
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.receiveShadow = true;
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.scene.add(this.groundMesh);

    // Contact material para rebote
    const contactMat = new CANNON.ContactMaterial(
      this.planePhysMat,
      this.spherePhysMat,
      { restitution: 0.6 } // más alto = más rebote
    );
    this.world.addContactMaterial(contactMat);

    // Raycasting
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.intersectionPoint = new THREE.Vector3();
    this.planeNormal = new THREE.Vector3();
    this.plane = new THREE.Plane();

    // Bindear eventos
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
    const radius = 1;

    // Malla visual
    const sphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 40, 40),
      new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff,
        metalness: 0,
        roughness: 0,
      })
    );
    sphereMesh.castShadow = true;
    this.scene.add(sphereMesh);

    // Cuerpo físico
    const pos = this.intersectionPoint;
    const sphereBody = new CANNON.Body({
      mass: 0.3,
      shape: new CANNON.Sphere(radius),
      position: new CANNON.Vec3(pos.x, pos.y + 1, pos.z),
      material: this.spherePhysMat,
    });
    this.world.addBody(sphereBody);

    this.meshes.push(sphereMesh);
    this.bodies.push(sphereBody);
  }

  tick(deltaTime) {
    this.world.step(1 / 60, deltaTime);

    // Actualizar meshes
    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].position.copy(this.bodies[i].position);
      this.meshes[i].quaternion.copy(this.bodies[i].quaternion);
    }

    // Sincronizar el piso
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
