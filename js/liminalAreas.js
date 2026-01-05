// js/liminalAreas.js
// A reusable framework for surreal liminal side-areas. Each area shares a consistent
// life cycle: entry trigger -> transition -> active loop -> exit/reset.

import * as THREE from 'three';
import * as state from './state.js';

class LiminalAreaManager {
    constructor(scene, camera, controls) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.defaultCameraFov = camera.fov;
        this.defaultMovementSpeed = state.movementSpeed;
        this.areas = [];
    }

    registerArea(config) {
        const pendingInteractables = [];
        const buildData = config.buildArea({
            registerInteractable: (interactable) => pendingInteractables.push(interactable)
        });

        const areaGroup = buildData.group || buildData;
        areaGroup.visible = false;
        areaGroup.position.copy(config.areaOrigin || new THREE.Vector3(1200, 0, 1200));
        this.scene.add(areaGroup);

        const areaState = {
            ...config,
            group: areaGroup,
            status: 'inactive',
            timer: 0,
            localState: buildData.localState || {},
            missingAssets: config.missingAssets || [],
            interactables: []
        };

        this._createEntryMarker(areaState);
        this._registerAreaInteractables(areaState, pendingInteractables);
        if (buildData.exitInteractable) {
            this._registerAreaExit(areaState, buildData.exitInteractable);
        }

        this.areas.push(areaState);
        state.liminalAreas.push(areaState);
        return areaState;
    }

    update(delta, time) {
        this.areas.forEach(area => this._updateArea(area, delta, time));
    }

    enterArea(area) {
        if (area.status !== 'inactive') return;
        area.status = 'entering';
        area.timer = 0;
        area.onEnterStart?.(area);
    }

    exitArea(area) {
        if (area.status !== 'active') return;
        area.status = 'exiting';
        area.timer = 0;
    }

    _updateArea(area, delta, time) {
        switch (area.status) {
            case 'entering':
                this._handleTransitionIn(area, delta, time);
                break;
            case 'active':
                area.onActive?.(area, delta, time);
                break;
            case 'exiting':
                this._handleTransitionOut(area, delta, time);
                break;
        }
    }

    _handleTransitionIn(area, delta, time) {
        area.timer += delta;
        const duration = area.transitionDuration || 3.0;
        const progress = Math.min(area.timer / duration, 1.0);

        const fovTarget = area.modulation?.fov ?? 10;
        this.camera.fov = THREE.MathUtils.lerp(this.defaultCameraFov, this.defaultCameraFov - fovTarget, progress);
        this.camera.updateProjectionMatrix();

        area.onTransitionInStep?.(area, progress, time);

        if (progress >= 1.0) {
            area.group.visible = true;
            const spawn = area.entrySpawn || new THREE.Vector3(0, 3, 0);
            const targetPosition = spawn.clone().add(area.group.position);
            this.controls.teleport(targetPosition);
            state.setMovementSpeed(area.modulation?.movementSpeed ?? this.defaultMovementSpeed);
            area.status = 'active';
            area.timer = 0;
            area.onEnterComplete?.(area);
        }
    }

    _handleTransitionOut(area, delta, time) {
        area.timer += delta;
        const duration = area.transitionDuration || 3.0;
        const progress = Math.min(area.timer / duration, 1.0);

        const fovTarget = area.modulation?.fov ?? 10;
        this.camera.fov = THREE.MathUtils.lerp(this.defaultCameraFov - fovTarget, this.defaultCameraFov, progress);
        this.camera.updateProjectionMatrix();

        area.onTransitionOutStep?.(area, progress, time);

        if (progress >= 1.0) {
            area.group.visible = false;
            this.controls.teleport(area.returnPosition || new THREE.Vector3(-120, 4, -460));
            state.setMovementSpeed(this.defaultMovementSpeed);
            area.status = 'inactive';
            area.timer = 0;
            area.onExitComplete?.(area);
        }
    }

    _registerAreaInteractables(area, interactables) {
        interactables.forEach(interactable => {
            const wrapped = {
                mesh: interactable.mesh,
                prompt: interactable.prompt,
                onInteract: () => interactable.onInteract?.(area)
            };
            state.interactables.push(wrapped);
            area.interactables.push(wrapped);
        });
    }

    _registerAreaExit(area, exitInteractable) {
        const exitItem = {
            mesh: exitInteractable.mesh,
            prompt: exitInteractable.prompt || 'Climb back to the desert?',
            onInteract: () => this.exitArea(area)
        };
        state.interactables.push(exitItem);
        area.interactables.push(exitItem);
    }

    _createEntryMarker(area) {
        const marker = new THREE.Mesh(
            new THREE.CylinderGeometry(1.25, 1.25, 2.5, 12),
            new THREE.MeshStandardMaterial({ color: 0x3d3a3a, emissive: 0x222244, roughness: 0.8 })
        );
        marker.position.copy(area.entryPosition || new THREE.Vector3(-120, 1, -460));
        marker.castShadow = true;
        marker.receiveShadow = true;
        this.scene.add(marker);

        const glow = new THREE.PointLight(area.entryGlowColor || 0xb7b1ff, 2, 25, 2);
        glow.position.copy(marker.position).add(new THREE.Vector3(0, 2.25, 0));
        this.scene.add(glow);

        const entry = {
            mesh: marker,
            prompt: area.entryPrompt || 'Step through?',
            onInteract: () => this.enterArea(area)
        };
        state.interactables.push(entry);
        area.interactables.push(entry);
    }
}

function createSiltChokedRadioObservatory(manager) {
    const areaOrigin = new THREE.Vector3(1200, 0, 1200);
    manager.registerArea({
        id: 'silt-radio-observatory',
        name: 'Silt-Choked Radio Observatory',
        entryPrompt: 'A half-buried dish hums beyond the dunes. Climb up?',
        entryPosition: new THREE.Vector3(-110, 1, -430),
        entryGlowColor: 0x9fb0d6,
        returnPosition: new THREE.Vector3(-110, 4, -424),
        areaOrigin,
        transitionDuration: 3.5,
        modulation: { fov: 12, movementSpeed: 30 },
        missingAssets: ['Custom radio static beds', 'Dust and sand shaders for the dish bowl'],
        buildArea: ({ registerInteractable }) => {
            const group = new THREE.Group();

            const ground = new THREE.Mesh(
                new THREE.CircleGeometry(30, 32),
                new THREE.MeshStandardMaterial({ color: 0x78675a, roughness: 0.95 })
            );
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            group.add(ground);

            const dish = new THREE.Mesh(
                new THREE.SphereGeometry(14, 32, 32, 0, Math.PI),
                new THREE.MeshStandardMaterial({ color: 0x8a8f9b, metalness: 0.3, roughness: 0.7 })
            );
            dish.scale.set(1, 0.5, 1);
            dish.rotation.x = -Math.PI / 2.3;
            dish.position.set(0, 2.5, 0);
            dish.castShadow = true;
            dish.receiveShadow = true;
            group.add(dish);

            const mast = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.6, 8, 12),
                new THREE.MeshStandardMaterial({ color: 0x4a525d, metalness: 0.4, roughness: 0.5 })
            );
            mast.position.set(0, 6, 0);
            mast.castShadow = true;
            group.add(mast);

            const receiver = new THREE.Mesh(
                new THREE.BoxGeometry(4, 1.5, 2.5),
                new THREE.MeshStandardMaterial({ color: 0x2f2f2f, roughness: 0.4, metalness: 0.2, emissive: 0x111122, emissiveIntensity: 0.4 })
            );
            receiver.position.set(-3, 1.2, 5);
            receiver.rotation.y = Math.PI / 8;
            receiver.castShadow = true;
            group.add(receiver);

            const receiverLight = new THREE.PointLight(0x88b7ff, 1.2, 20, 2);
            receiverLight.position.copy(receiver.position).add(new THREE.Vector3(0, 2, 0));
            group.add(receiverLight);

            const consoleTop = new THREE.Mesh(
                new THREE.BoxGeometry(3.5, 0.4, 2.2),
                new THREE.MeshStandardMaterial({ color: 0x1b1d26, emissive: 0x18203b, emissiveIntensity: 0.6 })
            );
            consoleTop.position.copy(receiver.position).add(new THREE.Vector3(0, 1, 0));
            group.add(consoleTop);

            const tuningKnob = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.35, 0.6, 16),
                new THREE.MeshStandardMaterial({ color: 0xd1d5e5, metalness: 0.5, roughness: 0.4 })
            );
            tuningKnob.rotation.z = Math.PI / 2;
            tuningKnob.position.copy(consoleTop.position).add(new THREE.Vector3(0.8, 0.4, 0));
            group.add(tuningKnob);

            registerInteractable({
                mesh: receiver,
                prompt: 'Tune the dish? (placeholder static bed)',
                onInteract: (area) => {
                    const readings = [
                        'A clean carrier tone slices through the wind.',
                        'Voices phase in and out. Words are lost.',
                        'Only the rumble of dunes answers.',
                        'A weather report for a town that never was.'
                    ];
                    area.localState.tuning = (area.localState.tuning || 0) + 1;
                    const idx = area.localState.tuning % readings.length;
                    const interactable = area.interactables.find(i => i.mesh === receiver);
                    if (interactable) {
                        interactable.prompt = readings[idx];
                    }
                    receiver.rotation.y += Math.PI / 16;
                    receiverLight.intensity = 1.2 + 0.4 * Math.sin(area.localState.tuning);
                }
            });

            const exitLadder = new THREE.Mesh(
                new THREE.BoxGeometry(1, 5, 0.4),
                new THREE.MeshStandardMaterial({ color: 0x8b6f5a, roughness: 0.8 })
            );
            exitLadder.position.set(6, 2.5, -4);
            group.add(exitLadder);

            return {
                group,
                localState: { tuning: 0 },
                exitInteractable: {
                    mesh: exitLadder,
                    prompt: 'Slide down the silted ladder.'
                }
            };
        },
        onTransitionInStep: (area, progress) => {
            area.group.rotation.y = Math.sin(progress * Math.PI) * 0.1;
        },
        onActive: (area, delta, time) => {
            const wobble = Math.sin(time * 0.6) * 0.15;
            area.group.rotation.y = wobble;
            const dish = area.group.children.find(c => c.geometry && c.geometry.type === 'SphereGeometry');
            if (dish) {
                dish.material.emissive = new THREE.Color(0x223344);
                dish.material.emissiveIntensity = 0.2 + 0.1 * Math.sin(time * 1.3 + area.localState.tuning);
            }
        }
    });
}

function createSaltFlatMirageArcade(manager) {
    const areaOrigin = new THREE.Vector3(1400, 0, -1200);
    manager.registerArea({
        id: 'salt-flat-mirage-arcade',
        name: 'Salt Flat Mirage Arcade',
        entryPrompt: 'Broken cabinets shimmer on the salt flat. Approach?',
        entryPosition: new THREE.Vector3(30, 1, -500),
        entryGlowColor: 0xffd1b3,
        returnPosition: new THREE.Vector3(30, 4, -494),
        areaOrigin,
        transitionDuration: 2.5,
        modulation: { fov: 8, movementSpeed: 40 },
        missingAssets: ['CRT hiss loops', 'Cabinet decals and bespoke screen shaders'],
        buildArea: ({ registerInteractable }) => {
            const group = new THREE.Group();

            const salt = new THREE.Mesh(
                new THREE.CircleGeometry(40, 48),
                new THREE.MeshStandardMaterial({ color: 0xdedbd4, roughness: 0.7 })
            );
            salt.rotation.x = -Math.PI / 2;
            salt.receiveShadow = true;
            group.add(salt);

            const cabinets = [];
            const screenMaterials = [];
            for (let x = -2; x <= 2; x++) {
                for (let z = -1; z <= 1; z++) {
                    const cabinet = new THREE.Mesh(
                        new THREE.BoxGeometry(2, 3.5, 1.5),
                        new THREE.MeshStandardMaterial({ color: 0x2d2d35, roughness: 0.6, metalness: 0.2 })
                    );
                    cabinet.position.set(x * 4, 1.75, z * 4 + 2);
                    cabinet.castShadow = true;
                    cabinet.rotation.y = (Math.random() - 0.5) * 0.3;
                    group.add(cabinet);
                    cabinets.push(cabinet);

                    const screenMaterial = new THREE.MeshStandardMaterial({ color: 0x0a0c10, emissive: 0x112233, emissiveIntensity: 0.8 });
                    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.0), screenMaterial);
                    screen.position.set(0, 0.5, 0.76);
                    cabinet.add(screen);
                    screenMaterials.push(screenMaterial);
                }
            }

            const lever = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.25, 1.5, 12),
                new THREE.MeshStandardMaterial({ color: 0xb36b4d, roughness: 0.5 })
            );
            lever.rotation.z = Math.PI / 4;
            lever.position.set(0, 1.2, -5);
            group.add(lever);

            registerInteractable({
                mesh: lever,
                prompt: 'Pull the mirage lever? (screens reshuffle)',
                onInteract: (area) => {
                    area.localState.shift = (area.localState.shift || 0) + Math.PI / 2;
                    lever.rotation.z += Math.PI / 8;
                    screenMaterials.forEach(mat => {
                        mat.emissive = new THREE.Color().setHSL(Math.random(), 0.6, 0.5);
                        mat.emissiveIntensity = 0.7 + Math.random() * 0.6;
                    });
                }
            });

            const exitStep = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.3, 3),
                new THREE.MeshStandardMaterial({ color: 0xb9b6ad, roughness: 0.9 })
            );
            exitStep.position.set(-6, 0.15, -6);
            group.add(exitStep);

            return {
                group,
                localState: { shift: 0 },
                exitInteractable: {
                    mesh: exitStep,
                    prompt: 'Step back toward the heat shimmer.'
                }
            };
        },
        onActive: (area, delta, time) => {
            const shimmer = 0.25 * Math.sin(time * 1.5 + area.localState.shift);
            area.group.children.forEach(child => {
                if (child.isMesh && child.geometry.type === 'BoxGeometry' && child.children.length > 0) {
                    child.rotation.y += delta * 0.2 * Math.sin(time + child.position.x);
                    const screen = child.children[0];
                    if (screen && screen.material) {
                        screen.material.emissiveIntensity = 0.6 + 0.4 * Math.sin(time * 2 + shimmer);
                    }
                }
            });
            area.group.position.y = Math.sin(time * 0.5) * 0.1;
        }
    });
}

function createForgottenMotelBasement(manager) {
    const areaOrigin = new THREE.Vector3(-1300, -5, 1200);
    manager.registerArea({
        id: 'forgotten-motel-basement',
        name: 'Forgotten Motel Basement',
        entryPrompt: 'A loose trapdoor yawns behind the roadhouse. Descend?',
        entryPosition: new THREE.Vector3(-160, 1, -520),
        entryGlowColor: 0xa3d3c2,
        returnPosition: new THREE.Vector3(-160, 4, -514),
        areaOrigin,
        transitionDuration: 3.0,
        modulation: { fov: 6, movementSpeed: 35 },
        missingAssets: ['Basement creak/vent loop', 'Peeling wallpaper textures'],
        buildArea: ({ registerInteractable }) => {
            const group = new THREE.Group();

            const corridor = new THREE.Mesh(
                new THREE.BoxGeometry(6, 3, 26),
                new THREE.MeshStandardMaterial({ color: 0x3b3a3a, roughness: 0.9, metalness: 0.05 })
            );
            corridor.position.set(0, 1.5, 0);
            corridor.receiveShadow = true;
            group.add(corridor);

            const floor = new THREE.Mesh(
                new THREE.PlaneGeometry(6, 26),
                new THREE.MeshStandardMaterial({ color: 0x60584f, roughness: 0.95 })
            );
            floor.rotation.x = -Math.PI / 2;
            floor.position.set(0, 0.01, 0);
            group.add(floor);

            const doors = [];
            for (let i = -2; i <= 2; i++) {
                const door = new THREE.Mesh(
                    new THREE.BoxGeometry(1.6, 2.5, 0.1),
                    new THREE.MeshStandardMaterial({ color: 0x8a5f4d, roughness: 0.8 })
                );
                door.position.set(i % 2 === 0 ? -2.5 : 2.5, 1.25, i * 3.2);
                door.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
                group.add(door);
                doors.push(door);
            }

            const clipboard = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.05, 0.8),
                new THREE.MeshStandardMaterial({ color: 0xc2b39f, roughness: 0.9 })
            );
            clipboard.position.set(0, 1.2, -8.5);
            clipboard.rotation.x = -Math.PI / 8;
            group.add(clipboard);

            const singleLight = new THREE.PointLight(0xf2e6c9, 1.6, 20, 2);
            singleLight.position.set(0, 2.4, -3);
            group.add(singleLight);

            const exitStairs = new THREE.Mesh(
                new THREE.BoxGeometry(2, 1, 2),
                new THREE.MeshStandardMaterial({ color: 0x4f4b46, roughness: 0.9 })
            );
            exitStairs.position.set(0, 0.5, 12);
            group.add(exitStairs);

            registerInteractable({
                mesh: clipboard,
                prompt: 'Flip the maintenance clipboard (tilt corridor)?',
                onInteract: (area) => {
                    area.localState.tilted = !area.localState.tilted;
                    clipboard.rotation.x += Math.PI / 12;
                }
            });

            return {
                group,
                localState: { tilted: false },
                exitInteractable: {
                    mesh: exitStairs,
                    prompt: 'Climb the stairs and push the hatch.'
                }
            };
        },
        onActive: (area, delta, time) => {
            const light = area.group.children.find(child => child.isPointLight);
            if (light) {
                light.intensity = 1.4 + (Math.random() - 0.5) * 0.4;
            }
            if (area.localState.tilted) {
                area.group.rotation.z = Math.sin(time * 0.8) * 0.05;
            } else {
                area.group.rotation.z = THREE.MathUtils.damp(area.group.rotation.z, 0, 0.25, delta);
            }
        }
    });
}

export function setupLiminalAreas(scene, camera, controls) {
    const manager = new LiminalAreaManager(scene, camera, controls);
    createSiltChokedRadioObservatory(manager);
    createSaltFlatMirageArcade(manager);
    createForgottenMotelBasement(manager);
    return manager;
}
