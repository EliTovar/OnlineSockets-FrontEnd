import * as CANNON from 'cannon-es';

export const physicsWorld = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0),
});

//Material por defecto
export const defaultMaterial = new CANNON.Material("default");
physicsWorld.defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    { restitution: 0.2 }
);