import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import * as state from './state.js';
import { initAudio } from './audio.js';

export function setupControls(camera) {
    const controls = new PointerLockControls(camera, document.body);
    document.body.addEventListener('click', () => { 
        controls.lock(); 
        initAudio();
        if (state.tvVideoElement && !state.videoAudioContext) {
            state.tvVideoElement.muted = false;
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaElementSource(state.tvVideoElement);
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0;
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            state.setVideoAudioContext(audioContext);
            state.setVideoAudioSource(source);
            state.setVideoGainNode(gainNode);
        }
    });
    document.addEventListener('keydown', (event) => {
        state.keys[event.code] = true;
        if (event.code === 'KeyE') {
            let closestInteractable = null;
            let closestDist = 5;
            state.interactables.forEach(interactable => {
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
    });
    document.addEventListener('keyup', (event) => { state.keys[event.code] = false; });
    return controls;
}

function checkCollision(playerNextPos) {
    const playerBox = new THREE.Box3().setFromCenterAndSize(playerNextPos, new THREE.Vector3(1, 5, 1));
    for (const collider of state.colliders) {
        const colliderBox = new THREE.Box3().setFromObject(collider);
        if (playerBox.intersectsBox(colliderBox)) {
            return true;
        }
    }
    return false;
}

export function updateMovement(delta, controls) {
    state.velocity.set(0, 0, 0);
    controls.getDirection(state.direction);
    state.direction.y = 0;
    state.direction.normalize();
    const right = new THREE.Vector3(-state.direction.z, 0, state.direction.x);
    if (state.keys['KeyW']) state.velocity.add(state.direction);
    if (state.keys['KeyS']) state.velocity.sub(state.direction);
    if (state.keys['KeyD']) state.velocity.add(right);
    if (state.keys['KeyA']) state.velocity.sub(right);
    if (state.velocity.length() > 0) {
        state.velocity.normalize().multiplyScalar(state.movementSpeed * delta);
        const player = controls.getObject();
        let nextPosX = new THREE.Vector3(player.position.x + state.velocity.x, player.position.y, player.position.z);
        if (!checkCollision(nextPosX)) {
            player.position.x += state.velocity.x;
        }
        let nextPosZ = new THREE.Vector3(player.position.x, player.position.y, player.position.z + state.velocity.z);
        if (!checkCollision(nextPosZ)) {
            player.position.z += state.velocity.z;
        }
    }
} 