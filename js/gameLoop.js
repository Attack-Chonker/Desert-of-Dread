import * as THREE from 'three';
import * as state from './state.js';
import { playMeow } from './audio.js';
import { updateMovement } from './controls.js';

function updateTvVolume(camera) {
    if (!state.tvVideoElement || !state.tvPosition || !state.videoGainNode) return;

    const saloonPosition = new THREE.Vector3(-150, 0, -500);
    const tvWorldPosition = new THREE.Vector3().copy(state.tvPosition).add(saloonPosition);
    const distance = camera.position.distanceTo(tvWorldPosition);

    let volume = 0;
    if (distance < 30) {
        volume = Math.max(0, 1 - (distance / 30));
    }
    
    state.videoGainNode.gain.setValueAtTime(volume, state.videoAudioContext.currentTime);
}

export function createGameLoop(scene, camera, renderer, controls, face) {
    function animate() {
        requestAnimationFrame(animate);
        const delta = state.clock.getDelta();
        const time = state.clock.getElapsedTime();

        if (controls.isLocked) {
            updateMovement(delta, controls);
        }

        const distanceToCat = state.cat ? camera.position.distanceTo(state.cat.position) : Infinity;

        switch(state.catState) {
            case 'idle':
                if (state.catHead) state.catHead.lookAt(camera.position);
                if (distanceToCat < 25) {
                    playMeow();
                    state.setCatState('approaching');
                }
                break;
            case 'approaching':
                if (state.catHead) state.catHead.lookAt(camera.position);
                if (distanceToCat > 10) {
                    const moveDirection = new THREE.Vector3().subVectors(camera.position, state.cat.position).normalize();
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
                if (state.catHead) state.catHead.lookAt(camera.position);
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
                if (state.catHead) state.catHead.lookAt(camera.position);
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
                    scene.remove(state.cat);
                    scene.remove(state.voidPortal);
                    scene.remove(state.voidLight);
                    state.getTentacles().forEach(t => scene.remove(t));
                    state.setCat(null);
                    state.setCatState('quiet_respite');
                    state.setCatStateTimer(5.0); // 5 second timer
                }
                break;
            case 'quiet_respite':
                state.setCatStateTimer(state.catStateTimer - delta);
                if (state.catStateTimer <= 0) {
                    const catMoon = state.catHead.clone();
                    catMoon.scale.setScalar(state.moon.geometry.parameters.radius / 0.8); // Match original moon size
                    catMoon.position.copy(state.moon.position);
                    catMoon.traverse(child => {
                        if (child.isMesh) {
                            child.material = child.material.clone();
                            child.material.transparent = true;
                            child.material.opacity = 0;
                        }
                    });
                    scene.add(catMoon);
                    state.setCatMoon(catMoon);
                    const catMoonLight = new THREE.PointLight(0xff0000, 0, 2000, 1);
                    catMoonLight.position.copy(state.moon.position);
                    scene.add(catMoonLight);
                    state.setCatMoonLight(catMoonLight);
                    state.setCatState('moon_swap');
                }
                break;
            case 'moon_swap':
                if (state.moon) {
                    state.moon.material.opacity -= 0.2 * delta;
                    state.moonLight.intensity -= 0.12 * delta;
                    if (state.moon.material.opacity <= 0) {
                        scene.remove(state.moon);
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
                if (state.catMoon) state.catMoon.lookAt(camera.position);
                break;
        }

        if (state.screenShake.duration > 0) {
            camera.position.x += (Math.random() - 0.5) * state.screenShake.intensity;
            camera.position.y += (Math.random() - 0.5) * state.screenShake.intensity;
            state.screenShake.duration -= delta;
        } else {
            state.screenShake.intensity = 0;
        }

        state.neonLights.forEach(light => { if (Math.random() > 0.98) { light.intensity = light.intensity > 0 ? 0 : 150; } });
        state.flickeringLights.forEach(light => {
            if (Math.random() > 0.9) {
                light.intensity = light.intensity > 0 ? 0 : 2;
            }
        });
        
        if (state.ghostState === 'hidden') {
            if (controls.isLocked && time > state.nextGhostAppearance) {
                state.setGhostState('visible');
                state.setGhostTimer(Math.random() * 1.0 + 0.3);
                camera.getWorldDirection(state.cameraDirection);
                const distanceBehind = Math.random() * 15 + 20;
                const appearPosition = camera.position.clone().sub(state.cameraDirection.multiplyScalar(distanceBehind));
                appearPosition.y = camera.position.y + (Math.random() - 0.5) * 4;
                face.position.copy(appearPosition);
                face.lookAt(camera.position);
                face.visible = true;
            }
        } else if (state.ghostState === 'visible') {
            state.setGhostTimer(state.ghostTimer - delta);
            if (state.ghostTimer <= 0) {
                state.setGhostState('hidden');
                face.visible = false;
                state.setNextGhostAppearance(time + Math.random() * 20 + 10);
            } else {
                face.lookAt(camera.position);
            }
        }

        updateTvVolume(camera);
        renderer.render(scene, camera);
    }
    animate();
} 