import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

import { setupScene } from './scene.js';
import { createLightingAndWorld, createStars, createMoon, createGasStation, createSaloon, createCat, createVoidPortalAndTentacles, createTrashCans, createVegetation, createWaterTower, createTelephonePoles, createEnterableCar, createGasStationSign, createFace } from './actors.js';
import { setupControls } from './controls.js';
import { createGameLoop } from './gameLoop.js';
import { colliders } from './state.js';

// --- MAIN INITIALIZATION ---
// This function runs once the entire page (including all scripts) is loaded.
window.onload = function() {
    // --- 1. Basic Scene Setup ---
    // Initialize the scene, camera, and renderer.
    const { scene, camera, renderer } = setupScene();

    // --- 2. Create Static World and Actors ---
    // These objects do not depend on any external assets like fonts.
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

    // --- 3. Setup Player Controls ---
    const controls = setupControls(camera, renderer.domElement);

    // --- 4. Asynchronously Load Fonts and Create Dependent Actors ---
    // The FontLoader loads assets in the background. The code inside the callback
    // function will only run once the font file is downloaded and ready.
    const loader = new FontLoader();
    loader.load(
        // URL of the font to load
        'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/fonts/helvetiker_bold.typeface.json', 
        
        // --- OnLoad Callback ---
        // This function is executed when the font is successfully loaded.
        function (font) {
            // Now that we have the font, we can create the objects that use it.
            createSaloon(scene, font);
            createGasStationSign(scene, font);

            // --- 5. Finalize Colliders and Start the Game ---
            // It's crucial to do this *inside* the callback to ensure that
            // colliders from the saloon and sign are included.
            console.log('All assets loaded, finalizing setup...');
            
            // Compute bounding boxes for all colliders for accurate physics.
            colliders.forEach(c => {
                c.updateWorldMatrix(true, false);
                if (c.geometry) { // It's a Mesh
                    c.geometry.computeBoundingBox();
                } else { // It's a Group, so we check its children
                    c.traverse((child) => {
                        if (child.isMesh) {
                            child.geometry.computeBoundingBox();
                        }
                    });
                }
            });

            // Start the game's animation loop.
            console.log('Starting game loop.');
            createGameLoop(scene, camera, renderer, controls, face);
        },

        // --- OnProgress Callback (Optional) ---
        undefined,

        // --- OnError Callback ---
        // This function is executed if the font fails to load.
        function (err) {
            console.error('An error happened while loading the font.');
            console.error(err);
        }
    );
};
