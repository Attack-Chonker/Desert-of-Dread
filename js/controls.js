// js/controls.js

import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import * as state from './state.js';
import { initAudio } from './audio.js';

export class Controls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.controls = new PointerLockControls(camera, domElement);

        domElement.addEventListener('click', () => {
            this.controls.lock();
            initAudio();
        });

        document.addEventListener('keydown', (event) => {
            state.keys[event.code] = true;
            if (event.code === 'KeyE' && this.controls.isLocked) {
                this.handleInteraction();
            }
        });

        document.addEventListener('keyup', (event) => {
            state.keys[event.code] = false;
        });
    }

    handleInteraction() {
        let closestInteractable = null;
        // Increased interaction distance from 5 to 8
        let closestDist = 8; 

        console.log("Attempting interaction..."); // A whisper to the console

        state.interactables.forEach(interactable => {
            const worldPosition = new THREE.Vector3();
            interactable.mesh.getWorldPosition(worldPosition);
            const dist = this.camera.position.distanceTo(worldPosition);
            
            // Log each potential interactable that is close enough
            if (dist < closestDist) {
                console.log(`Found interactable: ${interactable.prompt} at distance: ${dist}`);
                closestDist = dist;
                closestInteractable = interactable;
            }
        });

        if (closestInteractable) {
            console.log(`Interacting with: ${closestInteractable.prompt}`);
            closestInteractable.onInteract();
        } else {
            console.log("No interactable object in range.");
        }
    }

    updateInteractionPrompt() {
        const prompt = document.getElementById('interaction-prompt');
        let closestInteractable = null;
        // Increased interaction distance from 5 to 8
        let closestDist = 8;

        state.interactables.forEach(interactable => {
            const worldPosition = new THREE.Vector3();
            interactable.mesh.getWorldPosition(worldPosition);
            const dist = this.camera.position.distanceTo(worldPosition);
            if (dist < closestDist) {
                closestDist = dist;
                closestInteractable = interactable;
            }
        });

        if (closestInteractable && this.controls.isLocked) {
            prompt.innerText = closestInteractable.prompt;
            prompt.style.display = 'block';
        } else {
            prompt.style.display = 'none';
        }
    }

    update(delta) {
        if (this.controls.isLocked) {
            this.updateMovement(delta);
        }
        this.updateInteractionPrompt();
    }

    updateMovement(delta) {
        state.velocity.set(0, 0, 0);
        const direction = new THREE.Vector3();
        this.controls.getDirection(direction);
        direction.y = 0;
        direction.normalize();

        const right = new THREE.Vector3(-direction.z, 0, direction.x);

        if (state.keys['KeyW']) state.velocity.add(direction);
        if (state.keys['KeyS']) state.velocity.sub(direction);
        if (state.keys['KeyD']) state.velocity.add(right);
        if (state.keys['KeyA']) state.velocity.sub(right);

        if (state.velocity.length() > 0) {
            state.velocity.normalize().multiplyScalar(state.movementSpeed * delta);
            const player = this.controls.getObject();

            const checkCollision = (nextPos) => {
                const playerBox = new THREE.Box3().setFromCenterAndSize(nextPos, new THREE.Vector3(1, 5, 1));
                for (const collider of state.colliders) {
                    if (!collider.visible && state.lodgeState !== 'active') continue;
                    const colliderBox = new THREE.Box3().setFromObject(collider);
                    if (playerBox.intersectsBox(colliderBox)) {
                        return true;
                    }
                }
                return false;
            };

            const nextPosX = player.position.clone();
            nextPosX.x += state.velocity.x;
            if (!checkCollision(nextPosX)) {
                player.position.x += state.velocity.x;
            }

            const nextPosZ = player.position.clone();
            nextPosZ.z += state.velocity.z;
            if (!checkCollision(nextPosZ)) {
                player.position.z += state.velocity.z;
            }
        }
    }
}
