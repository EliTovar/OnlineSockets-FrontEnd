// src/models/personaje.js
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

/**
 * Carga el modelo FBX del personaje y lo añade a la escena.
 * @param {THREE.Scene} scene - Escena principal donde añadir el modelo.
 * @param {Function} onLoad - Callback opcional para cuando el modelo esté listo.
 */

export function loadFBXPersonaje(scene, onLoad = () => {}) { //* 'scene': Lugar donde pondremos el personaje. 'onLoad': Funcion opcional que se ejecuta cuando todo ha terminado de cargarse (modelo y animaciones).
    const loader = new FBXLoader(); //Carga el modelo del personaje.

    //! Se carga el modelo base
    loader.load('/models/character-3/astronaut-cat/source/Space-cat-RE.fbx', (fbx) => { //Se crea un"cargador" ('fbx') para traer los archivos '.fbx' desde el disco.
        //Usamos el cargadr para traer el archivo del modelo al personaje (el cuerpo).
        fbx.scale.set(0.040, 0.040, 0.040); //Se hace pequeño o alto para que no sea gigante o enano.
        fbx.position.set(0, 0.5, 0); //Lo colocamos un poco más arriba para que no se entierre en el suelo.
        scene.add(fbx);//Lo añadimos a la escena para que se vea.

         //! se definen las rutas de animaciones
        const animationPaths = { //Objeto que contiene los combres de las animaciones
            idle:'/models/character-3/animations/cat-Re-animations/Happy Idle.fbx',
            walk: '/models/character-3/animations/cat-Re-animations/Happy Walk.fbx',
            back: '/models/character-3/animations/cat-Re-animations/Walk Backwards.fbx'
            // startwalk: '/models/character-3/animations/cat-Re-animations/Female Stop Walking.fbx',
            // endwalk: '/models/character-3/animations/cat-Re-animations/Female Start Walking.fbx'
        };
        
        const animations = {}; //Objeto vaío donde guardamos las animaciones cargadas.
        let loadedCount = 0; //Cuenta cuántas animaciones ya se han cargado.
        const totalToLoad = Object.keys(animationPaths).length; //Cuántas animaciones en total hay que cargar.
        
        //! Recorrer cada animación.
        for (const [name, path] of Object.entries(animationPaths)) { //Usamos un bucle para cargar cada animación (ejem. primero carga idle, walk, etc).
            loader.load(path, (animFBX) => {
                console.log(`✅ Animación ${name}:`, animFBX.animations[0].name);
                animations[name] = animFBX.animations[0]; //Tomamos la primera animación.
                animations[name].name = name; // ← le pones el nombre esperado: 'idle' o 'walk'
                loadedCount++; //Contamos cuántas ya se han cargado.

                //* Verificamos si todas las nimaciones ya se cargaron.
                if (loadedCount === totalToLoad) { //Si es así, ejecutamos la función 'onLoad()'.
                    const clips = Object.values(animations);
                    onLoad(fbx, clips); // 'fbx' = modelo del personaje | 'clips': un arreglo con todas las animaciones.
                    //Pasamos el personaje + animaciones.
                }
                //* Manejo de errores.
            }, undefined, (err) => { //Si no se carga la animación.
                console.error(`❌ Error al cargar animación ${name}:`, err);
            });
        }
    },
    undefined, 
    (error) => { //Si no se carga el modelo 'base' del peronaje.
        console.error('❌ Error al cargar personaje FBX:', error);
});
}
