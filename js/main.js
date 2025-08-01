// js/main.js
// The heart of the operation. It orchestrates the creation of our world.

import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

import { setupScene } from './scene.js';
import {
    createLightingAndWorld, createStars, createMoon, createGasStation,
    createRoadhouse, createCat, createVoidPortalAndTentacles, createTrashCans,
    createGhostwood, createWaterTower, createTelephonePoles, createEnterableCar,
    createGasStationSign, createFace, createBlackLodge, createMountainRange, createDoubleRDiner, createRedRoom, createRocket
} from './actors.js';
import { Controls } from './controls.js';
import { GameLoop } from './gameLoop.js';
import * as state from './state.js';

// --- MAIN INITIALIZATION ---
window.onload = function() {
    // --- 1. Basic Scene Setup ---
    const { scene, camera, renderer } = setupScene();

    // --- 2. Create Static World and Actors ---
    createLightingAndWorld(scene);
    createStars(scene);
    createMoon(scene);
    // The mountains rise, defining the edges of our reality.
    createMountainRange(scene);
    createCat(scene);
    createVoidPortalAndTentacles(scene);
    createTrashCans(scene);
    createGhostwood(scene);
    createRocket(scene);
    const face = createFace(scene);
    createWaterTower(scene);
    createTelephonePoles(scene);
    createEnterableCar(scene);

    // --- 3. Initialize Controls and Game Loop ---
    const controls = new Controls(camera, renderer.domElement);
    const gameLoop = new GameLoop(scene, camera, renderer, controls, face);

    // --- 4. Asynchronously Load Fonts and Create Dependent Actors ---
    // The font is the key to the signs, the signs are the key to the tavern,
    // and the tavern is the key to the Lodge itself.
    const loader = new FontLoader();
    loader.load(
        './fonts/helvetiker_bold.typeface.json',
        
        // --- OnLoad Callback ---
        function (font) {
            // Create actors that depend on the loaded font
            const roadhouse = createRoadhouse(scene, font, gameLoop);
            createGasStationSign(scene, font);
            createDoubleRDiner(scene, font, gameLoop);
            createGasStation(scene, font);
            // Create the hidden Black Lodge area within the saloon. It sleeps, waiting.
            createBlackLodge(roadhouse, gameLoop);
            // The Red Room is created but remains hidden, waiting for its cue.
            createRedRoom(scene);
 
             // --- 5. Finalize Colliders ---
            console.log('A place both wonderful and strange. Finalizing setup...');
            
            state.colliders.forEach(c => {
                c.updateWorldMatrix(true, false);
                if (c.geometry) {
                    c.geometry.computeBoundingBox();
                } else {
                    c.traverse((child) => {
                        if (child.isMesh) {
                            child.geometry.computeBoundingBox();
                        }
                    });
                }
            });
        },

        // --- OnError Callback ---
        function (err) {
            console.error('The thread is broken. The font could not be found.', err);
        }
    );

    console.log('The owls are not what they seem.');
    gameLoop.start();
};
