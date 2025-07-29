import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { initAudio } from './audio.js';
import { keys, interactables, velocity, direction, movementSpeed, colliders } from './state.js';

export function setupControls(camera, domElement) {
    const controls = new PointerLockControls(camera, domElement);
    
    document.body.addEventListener('click', () => { 
        controls.lock(); 
        initAudio();
    });

    document.addEventListener('keydown', (event) => {
        keys[event.code] = true;
        if (event.code === 'KeyE') {
            handleInteraction(camera);
        }
    });

    document.addEventListener('keyup', (event) => { 
        keys[event.code] = false; 
    });

    return controls;
}

function handleInteraction(camera) {
    let closestInteractable = null;
    let closestDist = 5; // Max interaction distance

    interactables.forEach(interactable => {
        const worldPosition = new THREE.Vector3();
        interactable.mesh.getWorldPosition(worldPosition);
        const dist = camera.position.distanceTo(worldPosition);
        if (dist < closestDist) {
            closestDist = dist;
            closestInteractable = interactable;
        }
    });

    if (closestInteractable) {
        closestInteractable.onInteract();
    }
}

function checkCollision(playerNextPos) {
    const playerBox = new THREE.Box3().setFromCenterAndSize(playerNextPos, new THREE.Vector3(1, 5, 1));
    for (const collider of colliders) {
        const colliderBox = new THREE.Box3().setFromObject(collider);
        if (playerBox.intersectsBox(colliderBox)) {
            return true;
        }
    }
    return false;
}

export function updateMovement(delta, controls) {
    velocity.set(0, 0, 0);
    controls.getDirection(direction);
    direction.y = 0;
    direction.normalize();

    const right = new THREE.Vector3(-direction.z, 0, direction.x);

    if (keys['KeyW']) velocity.add(direction);
    if (keys['KeyS']) velocity.sub(direction);
    if (keys['KeyD']) velocity.add(right);
    if (keys['KeyA']) velocity.sub(right);

    if (velocity.length() > 0) {
        velocity.normalize().multiplyScalar(movementSpeed * delta);
        const player = controls.getObject();

        // Check collision for X and Z axes separately to allow sliding along walls
        let nextPosX = new THREE.Vector3(player.position.x + velocity.x, player.position.y, player.position.z);
        if (!checkCollision(nextPosX)) {
            player.position.x += velocity.x;
        }

        let nextPosZ = new THREE.Vector3(player.position.x, player.position.y, player.position.z + velocity.z);
        if (!checkCollision(nextPosZ)) {
            player.position.z += velocity.z;
        }
    }
}
