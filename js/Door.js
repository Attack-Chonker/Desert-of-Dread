// js/Door.js

import * as THREE from 'three';
import { interactables, colliders } from './state.js';

export class Door {
    constructor(isLeft, width, height, material, position, isCarDoor = false) {
        const doorWidthHalf = width / 2;
        
        const doorBody = new THREE.Group();
        
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(isCarDoor ? width : doorWidthHalf, height, 0.2),
            material
        );
        doorBody.add(panel);

        if (!isCarDoor) {
            const frameThickness = 0.3;
            const frameSide = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, height, 0.3), material);
            const frameTop = new THREE.Mesh(new THREE.BoxGeometry(doorWidthHalf, frameThickness, 0.3), material);

            const frameLeft = frameSide.clone();
            frameLeft.position.x = -doorWidthHalf / 2 + frameThickness / 2;
            const frameRight = frameSide.clone();
            frameRight.position.x = doorWidthHalf / 2 - frameThickness / 2;
            const frameTopCloned = frameTop.clone();
            frameTopCloned.position.y = height / 2 - frameThickness / 2;
            const frameBottomCloned = frameTop.clone();
            frameBottomCloned.position.y = -height / 2 + frameThickness / 2;
            
            const brace = new THREE.Mesh(new THREE.BoxGeometry(doorWidthHalf * 1.2, frameThickness, 0.3), material);
            const braceTop = brace.clone();
            braceTop.rotation.z = Math.PI / 4 * (isLeft ? 1 : -1);
            const braceBottom = brace.clone();
            braceBottom.rotation.z = Math.PI / 4 * (isLeft ? -1 : 1);
            
            doorBody.add(frameLeft, frameRight, frameTopCloned, frameBottomCloned, braceTop, braceBottom);
            doorBody.position.x = isLeft ? doorWidthHalf / 2 : -doorWidthHalf / 2;
        }
        
        doorBody.castShadow = true;

        this.doorGroup = new THREE.Group();
        this.doorGroup.add(doorBody);
        this.doorGroup.position.copy(position);
        
        this.doorMesh = doorBody;
        
        this.isAnimating = false;
        this.targetRotation = 0;
        
        this.interactable = {
            mesh: this.doorGroup,
            prompt: 'Press E to open',
            onInteract: () => {
                if (this.isAnimating) return;
                const isOpen = this.doorGroup.rotation.y !== 0;
                this.targetRotation = isOpen ? 0 : Math.PI / 1.8 * (isLeft ? 1 : -1);
                this.isAnimating = true;
                this.interactable.prompt = isOpen ? 'Press E to open' : 'Press E to close';
            }
        };

        interactables.push(this.interactable);
        colliders.push(this.doorMesh);
    }

    addToScene(parent) {
        parent.add(this.doorGroup);
    }

    update(delta) {
        if (this.isAnimating) {
            this.doorGroup.rotation.y = THREE.MathUtils.lerp(this.doorGroup.rotation.y, this.targetRotation, delta * 8);

            if (Math.abs(this.doorGroup.rotation.y - this.targetRotation) < 0.01) {
                this.doorGroup.rotation.y = this.targetRotation;
                this.isAnimating = false;
            }
        }
        this.doorMesh.updateWorldMatrix(true, false);
    }
}
