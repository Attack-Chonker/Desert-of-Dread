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
        modulation: { fov: 14, movementSpeed: 26 },
        missingAssets: ['Custom radio static beds', 'Dust and sand shaders for the dish bowl'],
        buildArea: ({ registerInteractable }) => {
            const group = new THREE.Group();

            const sandMaterial = new THREE.MeshStandardMaterial({ color: 0x8c7a66, roughness: 0.94, metalness: 0.05 });
            const ground = new THREE.Mesh(new THREE.CircleGeometry(32, 48), sandMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            group.add(ground);

            const duneMound = new THREE.Mesh(
                new THREE.SphereGeometry(18, 32, 24),
                new THREE.MeshStandardMaterial({ color: 0x9b8977, roughness: 0.92 })
            );
            duneMound.scale.set(1.4, 0.35, 1.2);
            duneMound.position.set(-6, 2.5, -4);
            duneMound.receiveShadow = true;
            duneMound.userData.isDune = true;
            group.add(duneMound);

            const duneLip = new THREE.Mesh(
                new THREE.TorusGeometry(16, 0.7, 12, 48),
                new THREE.MeshStandardMaterial({ color: 0xa49683, roughness: 0.88 })
            );
            duneLip.rotation.x = Math.PI / 2;
            duneLip.position.y = 0.8;
            group.add(duneLip);

            const dish = new THREE.Mesh(
                new THREE.SphereGeometry(15, 48, 48, 0, Math.PI),
                new THREE.MeshStandardMaterial({ color: 0x92979f, metalness: 0.42, roughness: 0.64, emissive: 0x111b27, emissiveIntensity: 0.25 })
            );
            dish.scale.set(1.05, 0.48, 1.05);
            dish.rotation.x = -Math.PI / 2.35;
            dish.position.set(0, 2.3, 0);
            dish.castShadow = true;
            dish.receiveShadow = true;
            group.add(dish);

            const rim = new THREE.Mesh(
                new THREE.TorusGeometry(15.2, 0.4, 16, 64, Math.PI),
                new THREE.MeshStandardMaterial({ color: 0x6f737c, metalness: 0.55, roughness: 0.3 })
            );
            rim.rotation.x = Math.PI / 2;
            rim.position.copy(dish.position);
            rim.castShadow = true;
            group.add(rim);

            const mast = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.65, 8.5, 16),
                new THREE.MeshStandardMaterial({ color: 0x4d5865, metalness: 0.48, roughness: 0.48 })
            );
            mast.position.set(0, 6.2, 0);
            mast.castShadow = true;
            group.add(mast);

            const receiver = new THREE.Mesh(
                new THREE.BoxGeometry(4.3, 1.7, 2.8),
                new THREE.MeshStandardMaterial({ color: 0x2b2f36, roughness: 0.35, metalness: 0.35, emissive: 0x151b2a, emissiveIntensity: 0.55 })
            );
            receiver.position.set(-3.2, 1.35, 5.3);
            receiver.rotation.y = Math.PI / 8;
            receiver.castShadow = true;
            group.add(receiver);

            const receiverPanel = new THREE.Mesh(
                new THREE.BoxGeometry(3.8, 0.3, 2.5),
                new THREE.MeshStandardMaterial({ color: 0x11141c, emissive: 0x0f1a33, emissiveIntensity: 0.7 })
            );
            receiverPanel.position.copy(receiver.position).add(new THREE.Vector3(0, 1.05, 0));
            group.add(receiverPanel);

            const tuningKnob = new THREE.Mesh(
                new THREE.CylinderGeometry(0.45, 0.45, 0.7, 24),
                new THREE.MeshStandardMaterial({ color: 0xd7dbe6, metalness: 0.52, roughness: 0.32 })
            );
            tuningKnob.rotation.z = Math.PI / 2;
            tuningKnob.position.copy(receiverPanel.position).add(new THREE.Vector3(1.1, 0.45, 0));
            group.add(tuningKnob);

            const gauge = new THREE.Mesh(
                new THREE.CylinderGeometry(0.6, 0.6, 0.18, 20),
                new THREE.MeshStandardMaterial({ color: 0x21242c, emissive: 0x0e1727, emissiveIntensity: 0.45 })
            );
            gauge.rotation.x = Math.PI / 2;
            gauge.position.copy(receiverPanel.position).add(new THREE.Vector3(-0.9, 0.3, 0.9));
            group.add(gauge);

            const receiverLight = new THREE.PointLight(0x8fc8ff, 1.4, 22, 2);
            receiverLight.position.copy(receiver.position).add(new THREE.Vector3(0, 2.3, 0));
            group.add(receiverLight);

            const fillLight = new THREE.HemisphereLight(0xb7c7e3, 0x2a1c12, 0.55);
            fillLight.position.set(0, 18, 0);
            group.add(fillLight);

            const walkway = new THREE.Mesh(
                new THREE.BoxGeometry(10, 0.4, 6),
                new THREE.MeshStandardMaterial({ color: 0x5e5449, roughness: 0.8 })
            );
            walkway.position.set(-1.5, 0.2, 4.2);
            walkway.rotation.y = Math.PI / 12;
            walkway.receiveShadow = true;
            group.add(walkway);

            const railing = new THREE.Mesh(
                new THREE.BoxGeometry(10, 0.08, 0.25),
                new THREE.MeshStandardMaterial({ color: 0x8f8a7f, metalness: 0.4, roughness: 0.5 })
            );
            railing.position.copy(walkway.position).add(new THREE.Vector3(0, 0.85, -2.9));
            group.add(railing);

            registerInteractable({
                mesh: receiver,
                prompt: 'Tune the dish? Rotate through signals.',
                onInteract: (area) => {
                    const palettes = [
                        {
                            prompt: 'A beacon cuts in: a cold, steady carrier tone.',
                            color: 0x9ccfff,
                            rimColor: 0xb7c7e3,
                            tint: 0x1e2e40,
                            intensity: 1.6
                        },
                        {
                            prompt: 'Faint voices rise then vanish beneath the wind.',
                            color: 0xffe3b0,
                            rimColor: 0xffc180,
                            tint: 0x3f2b1b,
                            intensity: 1.85
                        },
                        {
                            prompt: 'Static washes over you like nearby surf.',
                            color: 0x9ef0d0,
                            rimColor: 0xa3f3ff,
                            tint: 0x1c2f2b,
                            intensity: 1.4
                        },
                        {
                            prompt: 'A distorted weather report for nowhere in particular.',
                            color: 0xff9aa2,
                            rimColor: 0xfad7ff,
                            tint: 0x3a1c2e,
                            intensity: 2.0
                        }
                    ];

                    area.localState.tuningIndex = (area.localState.tuningIndex + 1) % palettes.length;
                    const active = palettes[area.localState.tuningIndex];
                    const interactable = area.interactables.find(i => i.mesh === receiver);
                    if (interactable) {
                        interactable.prompt = active.prompt;
                    }

                    receiver.rotation.y += Math.PI / 16;
                    tuningKnob.rotation.x += Math.PI / 18;
                    receiver.material.emissive = new THREE.Color(active.tint);
                    receiver.material.emissiveIntensity = 0.65;
                    gauge.material.emissive = new THREE.Color(active.rimColor);
                    gauge.material.emissiveIntensity = 0.9;
                    receiverLight.color = new THREE.Color(active.color);
                    receiverLight.intensity = active.intensity;
                    fillLight.color = new THREE.Color(active.rimColor);
                    dish.material.emissive = new THREE.Color(active.tint);
                    dish.material.emissiveIntensity = 0.35 + (area.localState.tuningIndex % 2) * 0.1;
                }
            });

            const exitLadder = new THREE.Mesh(
                new THREE.BoxGeometry(1, 5.6, 0.45),
                new THREE.MeshStandardMaterial({ color: 0x8b6f5a, roughness: 0.82 })
            );
            exitLadder.position.set(6.2, 2.8, -4.2);
            group.add(exitLadder);

            const ladderRungs = new THREE.Mesh(
                new THREE.BoxGeometry(0.9, 0.08, 0.42),
                new THREE.MeshStandardMaterial({ color: 0x6b4f3f, roughness: 0.75 })
            );
            ladderRungs.position.copy(exitLadder.position).add(new THREE.Vector3(0, 0, 0));
            ladderRungs.scale.y = 6;
            group.add(ladderRungs);

            const shadowLight = new THREE.SpotLight(0xd9c8b1, 1.1, 45, Math.PI / 4, 0.35, 1.8);
            shadowLight.position.set(-12, 16, 6);
            shadowLight.target.position.set(0, 1, 0);
            group.add(shadowLight);
            group.add(shadowLight.target);

            return {
                group,
                localState: { tuningIndex: 0 },
                exitInteractable: {
                    mesh: exitLadder,
                    prompt: 'Climb the ladder back to the desert wind.'
                },
                exitTarget: shadowLight
            };
        },
        onTransitionInStep: (area, progress) => {
            area.group.rotation.y = Math.sin(progress * Math.PI) * 0.1;
        },
        onActive: (area, delta, time) => {
            const wobble = Math.sin(time * 0.6) * 0.12;
            area.group.rotation.y = wobble;
            const dish = area.group.children.find(c => c.geometry && c.geometry.type === 'SphereGeometry');
            if (dish) {
                dish.material.emissiveIntensity = 0.28 + 0.14 * Math.sin(time * 1.3 + area.localState.tuningIndex);
            }
            const rim = area.group.children.find(c => c.geometry && c.geometry.type === 'TorusGeometry');
            if (rim) {
                rim.material.emissive = new THREE.Color(0x223244);
                rim.material.emissiveIntensity = 0.1 + 0.05 * Math.cos(time * 0.9);
            }
            const dunes = area.group.children.filter(c => c.userData?.isDune);
            dunes.forEach((dune, idx) => {
                dune.position.y = 2.4 + Math.sin(time * 0.25 + idx) * 0.05;
            });
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
