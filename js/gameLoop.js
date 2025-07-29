import * as THREE from 'three';
import * as state from './state.js';
import { playMeow } from './audio.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

/**
 * Initializes the Three.js scene, camera, and renderer.
 * @returns {{scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer}}
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
    document.body.appendChild(renderer.domElement);
    RectAreaLightUniformsLib.init();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer };
}

// --- Helper functions for procedural textures ---

export function createBrickTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const brickWidth = 64;
    const brickHeight = 32;
    const mortar = 4;

    ctx.fillStyle = '#3a2d27'; // Darker Mortar color
    ctx.fillRect(0, 0, 256, 256);

    for (let y = 0; y < 256; y += brickHeight) {
        for (let x = 0; x < 256; x += brickWidth) {
            const r = 140 + Math.random() * 20;
            const g = 75 + Math.random() * 15;
            const b = 63 + Math.random() * 10;
            ctx.fillStyle = `rgb(${r},${g},${b})`;

            let offsetX = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
            ctx.fillRect(x + offsetX, y, brickWidth - mortar, brickHeight - mortar);
            ctx.fillRect(x + offsetX - brickWidth, y, brickWidth - mortar, brickHeight - mortar);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
}

export function createCharredLogTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1a120b';
    ctx.fillRect(0, 0, 64, 256);

    ctx.strokeStyle = '#ff6000';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 64, Math.random() * 256);
        ctx.lineTo(Math.random() * 64, Math.random() * 256);
        ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

export function createEmberTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(7, 7, 2, 2); // small 2x2 square
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

export function createNewspaperTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e8e0d4';
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = '#333';
    ctx.font = 'bold 48px Times New Roman';
    ctx.textAlign = 'center';
    ctx.fillText('Strange Lights Over Desert', 256, 60);
    ctx.font = '16px Times New Roman';
    for (let y = 100; y < 240; y += 20) {
        ctx.fillText('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 256, y);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

export function createPlayingCardTexture(rank, suit) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 64, 96);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(2, 2, 60, 92);
    ctx.fillStyle = (suit === '♥' || suit === '♦') ? '#c00' : '#000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(rank, 32, 40);
    ctx.fillText(suit, 32, 70);
    return new THREE.CanvasTexture(canvas);
}

export function createZigZagFloorTexture() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128; canvas.height = 64;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = '#FFFFFF';
    for (let x = 0; x < 128; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x + 16, 32); ctx.lineTo(x + 32, 0);
        ctx.closePath(); ctx.fill();
    }
    for (let x = -16; x < 128; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 64); ctx.lineTo(x + 16, 32); ctx.lineTo(x + 32, 64);
        ctx.closePath(); ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    return texture;
}

export function createCurtainTexture() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128; canvas.height = 1;
    const gradient = ctx.createLinearGradient(0, 0, 128, 0);
    gradient.addColorStop(0, '#2c0001');
    gradient.addColorStop(0.2, '#5c0002');
    gradient.addColorStop(0.35, '#8b0003');
    gradient.addColorStop(0.5, '#5c0002');
    gradient.addColorStop(0.7, '#2c0001');
    gradient.addColorStop(0.85, '#5c0002');
    gradient.addColorStop(1, '#4c0001');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 1);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(50, 20);
    return texture;
}

function updateTvVolume(camera) {
    if (!state.tvVideoElement || !state.tvPosition || !state.videoGainNode) return;

    const tvWorldPosition = new THREE.Vector3();
    state.tvPosition.setFromMatrixPosition(state.tvVideoElement.matrixWorld); // This might be wrong, need to check where tvPosition is set
    tvWorldPosition.setFromMatrixPosition(state.tvVideoElement.matrixWorld);

    // A better way to get world position of an object inside a group
    const saloon = state.interactables[0].mesh.parent; // Hacky way to get saloon, should be improved
    const fireScreen = state.tvVideoElement.parent;
    if (saloon && fireScreen) {
        fireScreen.getWorldPosition(tvWorldPosition);
    }
    
    const distance = camera.position.distanceTo(tvWorldPosition);

    let volume = 0;
    if (distance < 30) {
        volume = Math.max(0, 1 - (distance / 30));
    }
    
    if(state.videoGainNode && state.videoAudioContext) {
        state.videoGainNode.gain.setValueAtTime(volume, state.videoAudioContext.currentTime);
    }
}


export class GameLoop {
    constructor(scene, camera, renderer, controls, face) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.controls = controls;
        this.face = face;
    }

    start() {
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = state.clock.getDelta();
        const time = state.clock.getElapsedTime();

        this.controls.update(delta);

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

        if (state.screenShake.duration > 0) {
            this.camera.position.x += (Math.random() - 0.5) * state.screenShake.intensity;
            this.camera.position.y += (Math.random() - 0.5) * state.screenShake.intensity;
            state.screenShake.duration -= delta;
        } else {
            state.screenShake.intensity = 0;
        }

        state.neonLights.forEach(light => { if (Math.random() > 0.98) { light.intensity = light.intensity > 0 ? 0 : 150; } });
        state.flickeringLights.forEach(light => {
            if (Math.random() > 0.9) {
                const isOn = light.intensity > 0;
                if (light.isSpotLight) {
                    light.intensity = isOn ? 0 : 20;
                } else {
                    light.intensity = isOn ? 0 : 2;
                }
            }
        });

        state.doors.forEach(door => door.update(delta));

        if (state.ghostState === 'hidden') {
            if (this.controls.isLocked && time > state.nextGhostAppearance) {
                state.setGhostState('visible');
                state.setGhostTimer(Math.random() * 1.0 + 0.3);
                this.camera.getWorldDirection(state.cameraDirection);
                const distanceBehind = Math.random() * 15 + 20;
                const appearPosition = this.camera.position.clone().sub(state.cameraDirection.multiplyScalar(distanceBehind));
                appearPosition.y = this.camera.position.y + (Math.random() - 0.5) * 4;
                this.face.position.copy(appearPosition);
                this.face.lookAt(this.camera.position);
                this.face.visible = true;
            }
        } else if (state.ghostState === 'visible') {
            state.setGhostTimer(state.ghostTimer - delta);
            if (state.ghostTimer <= 0) {
                state.setGhostState('hidden');
                this.face.visible = false;
                state.setNextGhostAppearance(time + Math.random() * 20 + 10);
            } else {
                this.face.lookAt(this.camera.position);
            }
        }

        updateTvVolume(this.camera);
        this.renderer.render(this.scene, this.camera);
    }
}
