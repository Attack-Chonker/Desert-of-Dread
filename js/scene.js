import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

/**
 * Initializes the Three.js scene, camera, and renderer.
 * @returns {{scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer}}
 */
export function setupScene() {
    const scene = new THREE.Scene();
    // A twilight backdrop with a hint of warmth. The desert exhales as the sun slips away.
    scene.background = new THREE.Color(0x1c2f49);
    // Softer evening haze to keep distant silhouettes visible while cooling the horizon.
    scene.fog = new THREE.Fog(0x1a2740, 80, 900);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(-150, 4, -460);

    // --- Flashlight Setup ---
    const flashlight = new THREE.SpotLight(0xfff8e7, 200.0, 25, Math.PI / 5, 0.5, 2);
    flashlight.position.set(0, 0, 1); // Directly in front of the camera
    flashlight.castShadow = true;
    flashlight.visible = false; // Start with the flashlight off
    flashlight.shadow.mapSize.width = 1024;
    flashlight.shadow.mapSize.height = 1024;
    flashlight.shadow.camera.near = 0.5;
    flashlight.shadow.camera.far = 25;
    flashlight.shadow.focus = 1;

    // Attach light to the camera
    camera.add(flashlight);
    camera.add(flashlight.target);
    flashlight.target.position.z = -1; // Make it point forward

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    scene.add(camera); // Add camera to the scene so the flashlight is visible
    RectAreaLightUniformsLib.init();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer };
}

// Texture functions have been moved to js/textures.js for better organization.
