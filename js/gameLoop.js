// js/gameLoop.js
// The relentless ticking of the clock. The loop that drives our reality forward, whether we want it to or not.

import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import * as state from './state.js';
import { playMeow, manageLodgeAudio } from './audio.js';
import { createDoppelganger } from './actors.js';

/**
 * Initializes the Three.js scene, camera, and renderer.
 */
export function setupScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 100, 800);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(-150, 4, -460);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer, dream-like shadows.
    document.body.appendChild(renderer.domElement);
    RectAreaLightUniformsLib.init();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer };
}

export class GameLoop {
    constructor(scene, camera, renderer, controls, face) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.controls = controls;
        this.face = face;
        this.lodgeTransitionTimer = 0;
        this.reversedTextEl = document.getElementById('reversed-text');
        this.lodgeMessageTimer = 0;
        this.currentLodgeMessage = "";
    }

    start() {
        this.animate();
    }
    
    triggerLodgeSequence() {
        if (state.lodgeState === 'inactive') {
            console.log("Let's rock!");
            state.setLodgeState('transitioning');
            manageLodgeAudio(true); // Start the lodge audio
            
            const jukeboxInteractable = state.interactables.find(i => i.prompt.includes('rock'));
            if (jukeboxInteractable) {
                jukeboxInteractable.prompt = "gniklat s'tel ,emit a evah"; // "have a time, let's talking" -> "Let's talk, have a time."
                jukeboxInteractable.onInteract = () => {}; // The jukebox has served its purpose.
            }

            // The way is open. The fireplace is no longer a barrier.
            const index = state.colliders.indexOf(state.fireplaceBacking);
            if (index > -1) {
                state.colliders.splice(index, 1);
            }

            // Your shadow self is born.
            if (!state.doppelganger) {
                const ganger = createDoppelganger();
                this.scene.add(ganger);
            }
        }
    }

    updateLodge(delta, time) {
        if (state.lodgeState === 'transitioning') {
            this.lodgeTransitionTimer += delta;
            const progress = Math.min(this.lodgeTransitionTimer / 5.0, 1.0);

            // The lights of the mundane world fade away.
            state.saloonLights.forEach(lightObj => {
                lightObj.light.intensity = lightObj.initialIntensity * (1 - progress);
            });

            if (state.fireplaceBacking) {
                state.fireplaceBacking.material.opacity = 1.0 - progress;
            }
            
            // The Lodge awakens.
            if (progress > 0.2 && state.blackLodge) {
                state.blackLodge.visible = true;
                if (state.lodgeStrobe) {
                    state.lodgeStrobe.intensity = 40 * progress;
                }
            }

            if (progress >= 1.0) {
                state.setLodgeState('active');
                if (state.saloonInterior) state.saloonInterior.visible = false;
                if (state.doppelganger) state.doppelganger.visible = true;
                this.reversedTextEl.style.display = 'block';
            }
        }

        if (state.lodgeState === 'active') {
            // The strobe light flickers erratically.
            if (state.lodgeStrobe) {
                state.lodgeStrobe.intensity = (Math.sin(time * 20) + Math.sin(time * 33) > 0.8) ? 60 : 0;
            }
            
            // The Man From Another Place dances.
            if (state.manFromAnotherPlace) {
                state.manFromAnotherPlace.position.y = Math.sin(time * 4) * 0.25;
            }

            // The world itself is unstable.
            if (state.blackLodge) {
                state.blackLodge.rotation.y += delta * 0.01;
            }

            // Your doppelganger watches you. It is always behind you.
            if (state.doppelganger) {
                const cameraDirection = new THREE.Vector3();
                this.camera.getWorldDirection(cameraDirection);
                const behindPosition = this.camera.position.clone().add(cameraDirection.multiplyScalar(-5));
                state.doppelganger.position.lerp(behindPosition, 0.1);
                state.doppelganger.lookAt(this.camera.position);
            }

            // Messages from the other side.
            this.lodgeMessageTimer -= delta;
            if (this.lodgeMessageTimer <= 0) {
                const messages = ["!uoy ekil kool I", "mug yfavorite fo elpuoc a", "emoclew era uoY", "?eeffoc dna eip fo tol A"];
                this.currentLodgeMessage = messages[Math.floor(Math.random() * messages.length)];
                this.reversedTextEl.innerText = this.currentLodgeMessage;
                this.lodgeMessageTimer = Math.random() * 8 + 8; // New message every 8-16 seconds.
            }
        }
    }


    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = state.clock.getDelta();
        const time = state.clock.getElapsedTime();

        this.controls.update(delta);
        
        this.updateLodge(delta, time);
        
        // --- Cat State Machine (unchanged) ---
        const distanceToCat = state.cat ? this.camera.position.distanceTo(state.cat.position) : Infinity;

        switch(state.catState) {
            case 'idle':
                if (state.catHead) state.catHead.lookAt(this.camera.position);
                if (distanceToCat < 25) {
                    playMeow();
                    state.setCatState('approaching');
                }
                break;
            case 'approaching':
                if (state.catHead) state.catHead.lookAt(this.camera.position);
                if (distanceToCat > 10) {
                    const moveDirection = new THREE.Vector3().subVectors(this.camera.position, state.cat.position).normalize();
                    state.cat.position.x += moveDirection.x * 1.5 * delta;
                    state.cat.position.z += moveDirection.z * 1.5 * delta;
                    state.voidPortal.position.x = state.cat.position.x;
                    state.voidPortal.position.z = state.cat.position.z;
                    state.voidLight.position.x = state.cat.position.x;
                    state.voidLight.position.z = state.cat.position.z;
                    state.getTentacles().forEach(t => {
                        t.position.x = state.cat.position.x + Math.cos(t.userData.angle) * t.userData.radius;
                        t.position.z = state.cat.position.z + Math.sin(t.userData.angle) * t.userData.radius;
                    });
                } else {
                    state.setCatState('staring');
                    state.setCatStateTimer(2.0);
                }
                break;
            case 'staring':
                if (state.catHead) state.catHead.lookAt(this.camera.position);
                state.setCatStateTimer(state.catStateTimer - delta);
                if (state.catStateTimer <= 0) {
                    state.setCatState('horrifying');
                    state.setCatStateTimer(3.0);
                    const redEyeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 2 });
                    state.cat.getObjectByName("leftEye").material = redEyeMaterial;
                    state.cat.getObjectByName("rightEye").material = redEyeMaterial;
                    if (state.rumbleNode) state.rumbleNode.gain.linearRampToValueAtTime(0.3, state.audioContext.currentTime + 1.0);
                    state.setScreenShake({ duration: 8.0, intensity: 0.05 });
                }
                break;
            case 'horrifying':
                if (state.catHead.rotation.y < Math.PI * 2) {
                    state.catHead.rotation.y += (Math.PI * 2 / 3.0) * delta;
                }
                state.setCatStateTimer(state.catStateTimer - delta);
                if (state.catStateTimer <= 0) {
                    state.setCatState('descending');
                }
                break;
            case 'descending':
                if (state.catHead) state.catHead.lookAt(this.camera.position);
                state.voidPortal.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05);
                state.voidLight.intensity = Math.min(state.voidLight.intensity + 2 * delta, 5);
                if (state.voidPortal.material.uniforms) state.voidPortal.material.uniforms.u_time.value = time;
                state.getTentacles().forEach(t => {
                    t.visible = true;
                    t.position.y = Math.min(t.position.y + 3 * delta, 0);
                    const points = t.geometry.parameters.path.points;
                    for(let i = 0; i < points.length; i++) {
                        const angle = time * 2 + i * 0.5;
                        points[i].x = Math.sin(angle) * 0.5;
                        points[i].z = Math.cos(angle) * 0.5;
                    }
                    t.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 20, 0.3, 8, false);
                });
                if (state.voidPortal.scale.x > 0.9) {
                    state.cat.position.y -= 1.0 * delta;
                }
                if (state.cat.position.y < -5) {
                    state.setCatState('descended');
                }
                break;
            case 'descended':
                state.voidPortal.scale.lerp(new THREE.Vector3(0, 0, 0), 0.1);
                state.voidLight.intensity = Math.max(state.voidLight.intensity - 4 * delta, 0);
                if (state.rumbleNode) state.rumbleNode.gain.linearRampToValueAtTime(0, state.audioContext.currentTime + 1.0);
                state.getTentacles().forEach(t => { t.position.y -= 5 * delta; });
                if (state.voidPortal.scale.x < 0.01) {
                    this.scene.remove(state.cat);
                    this.scene.remove(state.voidPortal);
                    this.scene.remove(state.voidLight);
                    state.getTentacles().forEach(t => this.scene.remove(t));
                    state.setCat(null);
                    state.setCatState('quiet_respite');
                    state.setCatStateTimer(5.0);
                }
                break;
            case 'quiet_respite':
                state.setCatStateTimer(state.catStateTimer - delta);
                if (state.catStateTimer <= 0) {
                    const catMoon = state.catHead.clone();
                    catMoon.scale.setScalar(state.moon.geometry.parameters.radius / 0.8);
                    catMoon.position.copy(state.moon.position);
                    catMoon.traverse(child => {
                        if (child.isMesh) {
                            child.material = child.material.clone();
                            child.material.transparent = true;
                            child.material.opacity = 0;
                        }
                    });
                    this.scene.add(catMoon);
                    state.setCatMoon(catMoon);
                    const catMoonLight = new THREE.PointLight(0xff0000, 0, 2000, 1);
                    catMoonLight.position.copy(state.moon.position);
                    this.scene.add(catMoonLight);
                    state.setCatMoonLight(catMoonLight);
                    state.setCatState('moon_swap');
                }
                break;
            case 'moon_swap':
                if (state.moon) {
                    state.moon.material.opacity -= 0.2 * delta;
                    state.moonLight.intensity -= 0.12 * delta;
                    if (state.moon.material.opacity <= 0) {
                        this.scene.remove(state.moon);
                        state.setMoon(null);
                    }
                }
                if (state.catMoon) {
                    state.catMoon.traverse(child => {
                        if (child.isMesh) {
                            child.material.opacity = Math.min(child.material.opacity + 0.2 * delta, 1);
                        }
                    });
                    state.catMoonLight.intensity = Math.min(state.catMoonLight.intensity + 0.4 * delta, 2);
                    if (state.catMoon.children[0].material.opacity >= 1) {
                        state.setCatState('watching');
                        document.getElementById('warning').innerText = "IT IS WATCHING";
                    }
                }
                break;
            case 'watching':
                if (state.catMoon) state.catMoon.lookAt(this.camera.position);
                break;
        }


        state.flickeringLights.forEach(light => {
            if (Math.random() > 0.9) {
                const isOn = light.intensity > 0;
                if (state.lodgeState === 'inactive') {
                    if (light.isSpotLight) {
                        light.intensity = isOn ? 0 : 20;
                    } else {
                        light.intensity = isOn ? 0 : 2;
                    }
                }
            }
        });

        state.doors.forEach(door => door.update(delta));

        this.renderer.render(this.scene, this.camera);
    }
}
