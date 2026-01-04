// js/controls.js

import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import * as state from './state.js';
import { initAudio, playFlashlightClick } from './audio.js';

export class Controls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.controls = new PointerLockControls(camera, domElement);

        this.crosshair = document.getElementById('crosshair');
        this.titleCard = document.getElementById('title-card');
        this.resumeHint = document.getElementById('resume-hint');
        this.startButton = document.getElementById('start-button');
        this.resumeButton = document.getElementById('resume-button');

        domElement.addEventListener('click', () => {
            this.controls.lock();
            initAudio();
        });

        if (this.startButton) {
            this.startButton.addEventListener('click', (event) => {
                event.stopPropagation();
                this.controls.lock();
                // Immediately clear the overlay so players aren't stuck if pointer lock is denied
                this._togglePanel(this.titleCard, false);
                this._togglePanel(this.resumeHint, false);
                initAudio();
            });
        }

        if (this.resumeButton) {
            this.resumeButton.addEventListener('click', (event) => {
                event.stopPropagation();
                this.controls.lock();
            });
        }

        this.controls.addEventListener('lock', () => {
            this._showCrosshair(true);
            this._togglePanel(this.titleCard, false);
            this._togglePanel(this.resumeHint, false);
        });

        this.controls.addEventListener('unlock', () => {
            this._showCrosshair(false);
            if (this.titleCard && this.titleCard.classList.contains('hidden')) {
                this._togglePanel(this.resumeHint, true);
            }
        });

        document.addEventListener('keydown', (event) => {
            state.keys[event.code] = true;
            if (event.code === 'KeyE' && this.controls.isLocked) {
                this.handleInteraction();
            }
            if (event.code === 'KeyF' && this.controls.isLocked) {
                this.toggleFlashlight();
            }
        });

        document.addEventListener('keyup', (event) => {
            state.keys[event.code] = false;
        });

        domElement.addEventListener('mousedown', (event) => {
        });
    }

    getObject() {
        return this.controls.getObject();
    }

    teleport(position) {
        this.controls.getObject().position.copy(position);
    }

     handleInteraction() {
        let closestInteractable = null;
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

        if (closestInteractable) {
            closestInteractable.onInteract();
        }
    }

    updateInteractionPrompt() {
        const prompt = document.getElementById('interaction-prompt');
        let closestInteractable = null;
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

    toggleFlashlight() {
        const flashlight = this.camera.children.find(child => child.isSpotLight);
        if (flashlight) {
            flashlight.visible = !flashlight.visible;
            playFlashlightClick();
        }
    }

    update(delta) {
        if (this.controls.isLocked) {
            this.updateMovement(delta);
        }
        this.updateInteractionPrompt();
    }

    _showCrosshair(show) {
        if (!this.crosshair) return;
        if (show) {
            this.crosshair.classList.remove('hidden');
        } else {
            this.crosshair.classList.add('hidden');
        }
    }

    _togglePanel(panelEl, shouldShow) {
        if (!panelEl) return;
        if (shouldShow) {
            panelEl.classList.remove('hidden');
        } else {
            panelEl.classList.add('hidden');
        }
    }

    updateMovement(delta) {
        if (state.isPlayerInRocket) {
            state.velocity.set(0, 0, 0);
            return;
        }
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

            // This function now robustly checks if an object is truly visible in the scene.
            const isActuallyVisible = (obj) => {
                let current = obj;
                while (current) {
                    if (!current.visible) return false;
                    current = current.parent;
                }
                return true;
            }

            const checkCollision = (nextPos) => {
                const playerBox = new THREE.Box3().setFromCenterAndSize(nextPos, new THREE.Vector3(1, 5, 1));
                for (const collider of state.colliders) {
                    // If the collider or any of its parents are not visible, we ignore it.
                    // This correctly handles the saloon interior disappearing and the lodge appearing.
                    if (!isActuallyVisible(collider)) {
                        continue;
                    }
                    
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
