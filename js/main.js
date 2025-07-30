// js/main.js
// The heart of the operation. It orchestrates the creation of our world.

import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

import { setupScene } from './gameLoop.js';
import { 
    createLightingAndWorld, createStars, createMoon, createGasStation, 
    createSaloon, createCat, createVoidPortalAndTentacles, createTrashCans, 
    createVegetation, createWaterTower, createTelephonePoles, createEnterableCar, 
    createGasStationSign, createFace, createBlackLodge 
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
    createGasStation(scene);
    createCat(scene);
    createVoidPortalAndTentacles(scene);
    createTrashCans(scene);
    createVegetation(scene);
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
        'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/fonts/helvetiker_bold.typeface.json', 
        
        // --- OnLoad Callback ---
        function (font) {
            // Create actors that depend on the loaded font
            const saloon = createSaloon(scene, font, gameLoop);
            createGasStationSign(scene, font);
            // Create the hidden Black Lodge area within the saloon. It sleeps, waiting.
            createBlackLodge(saloon);

            // --- 5. Finalize Colliders and Start the Game ---
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

            console.log('The owls are not what they seem.');
            gameLoop.start();
        },

        // --- OnError Callback ---
        function (err) {
            console.error('The thread is broken. The font could not be found.', err);
        }
    );
};
