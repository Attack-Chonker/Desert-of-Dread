import { setupScene } from './scene.js';
import { createLightingAndWorld, createStars, createMoon, createGasStation, createCat, createVoidPortalAndTentacles, createTrashCans, createVegetation, createFace } from './actors.js';
import { setupControls } from './controls.js';
import { createGameLoop } from './gameLoop.js';

const { scene, camera, renderer } = setupScene();

createLightingAndWorld(scene);
createStars(scene);
createMoon(scene);
createGasStation(scene);
createCat(scene);
createVoidPortalAndTentacles(scene);
createTrashCans(scene);
createVegetation(scene);
const face = createFace(scene);

const controls = setupControls(camera);

createGameLoop(scene, camera, renderer, controls, face); 