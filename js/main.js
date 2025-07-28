import { setupScene } from './scene.js';
import { createLightingAndWorld, createStars, createMoon, createGasStation, createSaloon, createCat, createVoidPortalAndTentacles, createTrashCans, createVegetation, createFace } from './actors.js';
import { setupControls } from './controls.js';
import { createGameLoop } from './gameLoop.js';
import * as state from './state.js';

const { scene, camera, renderer } = setupScene();

createLightingAndWorld(scene);
createStars(scene);
createMoon(scene);
createGasStation(scene);
const saloon = createSaloon(scene);
createCat(scene);
createVoidPortalAndTentacles(scene);
createTrashCans(scene);
createVegetation(scene);
const face = createFace(scene);

const controls = setupControls(camera);

// Centralized collider initialization
state.colliders.forEach(c => {
    c.updateWorldMatrix(true, false);
    if (c.geometry) { // It's a Mesh
        c.geometry.computeBoundingBox();
    } else { // It's a Group, handle children
        c.traverse((child) => {
            if (child.isMesh) {
                child.geometry.computeBoundingBox();
            }
        });
    }
});

createGameLoop(scene, camera, renderer, controls, face); 