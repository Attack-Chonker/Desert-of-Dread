// js/gameLoop.js
// The relentless ticking of the clock. The loop that drives our reality forward, whether we want it to or not.

import * as THREE from 'three';
import * as state from './state.js';
import { playMeow, manageLodgeAudio, manageRedRoomAudio, manageCasinoAudio, playSlotMachineSpin } from './audio.js';
import { createDoppelganger } from './actors.js';
 
 export class GameLoop {
     constructor(scene, camera, renderer, controls, face) {
         this.scene = scene;
         this.camera = camera;
         this.renderer = renderer;
         this.controls = controls;
         this.face = face;
         this.lodgeTransitionTimer = 0;
         this.redRoomTransitionTimer = 0;
         this.reversedTextEl = document.getElementById('reversed-text');
         this.lodgeMessageTimer = 0;
        this.currentLodgeMessage = "";

        // Add MDT light to the camera
        const mdtLight = new THREE.SpotLight(0xffffff, 1.5, 200, Math.PI / 7, 0.4, 1.5);
        mdtLight.castShadow = true;
        mdtLight.visible = false;
        camera.add(mdtLight);
        mdtLight.position.set(0, 0, 1);
        mdtLight.target = camera;
        state.mdt.light = mdtLight;
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

    triggerRedRoomSequence() {
        if (state.redRoomState === 'inactive') {
            console.log("A place both wonderful and strange.");
            state.setRedRoomState('transitioning');
            manageRedRoomAudio(true);
            state.setHasOwlCaveCoin(false); // The coin is "used"
        }
    }

    triggerLodgeExit() {
        if (state.lodgeState === 'active') {
            console.log("You can leave. For now.");
            state.setLodgeState('exiting');
            this.lodgeTransitionTimer = 0; // Reset timer for the exit transition
            manageLodgeAudio(false); // Start fading out lodge audio
        }
    }
 
      // Manages all logic related to the Black Lodge sequence.
      updateLodge(delta, time) {
          switch (state.lodgeState) {
              case 'transitioning':
                  this._updateLodgeTransitionIn(delta);
                  break;
              case 'active':
                  this._updateLodgeActive(delta, time);
                  break;
              case 'exiting':
                  this._updateLodgeTransitionOut(delta);
                  break;
          }
      }
  
      // Handles the transition into the Black Lodge.
      _updateLodgeTransitionIn(delta) {
          this.lodgeTransitionTimer += delta;
          const progress = Math.min(this.lodgeTransitionTimer / 5.0, 1.0);
  
          // Fade out the real world
          if (state.roadhouseLights && state.roadhouseLights.length > 0) {
              state.roadhouseLights.forEach(lightObj => {
                  lightObj.light.intensity = lightObj.initialIntensity * (1 - progress);
              });
          }
          if (state.fireplaceBacking) {
              state.fireplaceBacking.material.opacity = 1.0 - progress;
          }
  
          // Fade in the Lodge
          if (progress > 0.2 && state.blackLodge) {
              state.blackLodge.visible = true;
              if (state.lodgeStrobe) {
                  state.lodgeStrobe.intensity = 40 * progress;
              }
          }
  
          // Finalize transition
          if (progress >= 1.0) {
              state.setLodgeState('active');
              if (state.roadhouseInterior) state.roadhouseInterior.visible = false;
              if (state.doppelganger) state.doppelganger.visible = true;
              this.reversedTextEl.style.display = 'block';
              this.lodgeMessageTimer = 15; // Set timer to enable exit
          }
      }
  
      // Handles the main logic while the player is inside the Black Lodge.
      _updateLodgeActive(delta, time) {
          // Strobe light effect
          if (state.lodgeStrobe) {
              state.lodgeStrobe.intensity = (Math.sin(time * 20) + Math.sin(time * 33) > 0.8) ? 60 : 0;
          }
  
          // Man From Another Place dance
          if (state.lodgeMan) {
              state.lodgeMan.position.y = Math.sin(time * 4) * 0.25;
          }
  
          // Unstable world rotation
          if (state.blackLodge) {
              state.blackLodge.rotation.y += delta * 0.01;
          }
  
          this._updateDoppelganger(delta);
          this._updateLodgeReversedMessage(delta);
      }
  
      // Handles the player's shadow self.
      _updateDoppelganger(delta) {
          if (!state.doppelganger) return;
  
          // Randomly flicker visibility
          if (Math.random() < 0.005) {
              state.doppelganger.visible = !state.doppelganger.visible;
          }
  
          // Keep it behind the player
          if (state.doppelganger.visible) {
              const cameraDirection = new THREE.Vector3();
              this.camera.getWorldDirection(cameraDirection);
              const behindPosition = this.camera.position.clone().add(cameraDirection.multiplyScalar(-5));
              state.doppelganger.position.lerp(behindPosition, 0.1);
              state.doppelganger.lookAt(this.camera.position);
          }
      }
  
      // Handles the reversed text messages that appear.
      _updateLodgeReversedMessage(delta) {
          this.lodgeMessageTimer -= delta;
          if (this.lodgeMessageTimer > 0) {
              this.reversedTextEl.innerText = this.currentLodgeMessage;
          } else if (!state.canExitLodge) {
              state.setCanExitLodge(true);
              const lauraInteractable = state.interactables.find(i => i.mesh === state.lauraDoppelganger);
              if (lauraInteractable) {
                  lauraInteractable.prompt = "Sometimes my arms bend back.";
              }
              this.reversedTextEl.innerText = "emoclew si eno oN"; // "No one is welcome"
          }
      }
  
      // Handles the transition out of the Black Lodge.
      _updateLodgeTransitionOut(delta) {
          this.lodgeTransitionTimer += delta;
          const progress = Math.min(this.lodgeTransitionTimer / 5.0, 1.0);
  
          // Fade in the real world
          if (state.roadhouseLights && state.roadhouseLights.length > 0) {
              state.roadhouseLights.forEach(lightObj => {
                  lightObj.light.intensity = lightObj.initialIntensity * progress;
              });
          }
          if (progress > 0.5 && state.roadhouseInterior) {
              state.roadhouseInterior.visible = true;
          }
  
          // Fade out the Lodge
          if (state.blackLodge && state.lodgeStrobe) {
              state.lodgeStrobe.intensity = 40 * (1 - progress);
          }
  
          // Finalize transition
          if (progress >= 1.0) {
              state.setLodgeState('inactive');
              if (state.blackLodge) state.blackLodge.visible = false;
              if (state.doppelganger) state.doppelganger.visible = false;
              this.reversedTextEl.style.display = 'none';
              
              // Reset the fireplace barrier
              if (!state.colliders.includes(state.fireplaceBacking)) {
                  state.colliders.push(state.fireplaceBacking);
              }
              if (state.fireplaceBacking) {
                  state.fireplaceBacking.material.opacity = 1.0;
              }
              
              // Move player back to the main room
              this.controls.teleport(new THREE.Vector3(-150, 4, -490));
              state.setCanExitLodge(false);
          }
      }

    // Manages all logic related to the Red Room sequence.
    updateRedRoom(delta, time) {
        switch (state.redRoomState) {
            case 'transitioning':
                this._updateRedRoomTransitionIn(delta);
                break;
            case 'active':
                this._updateRedRoomActive(delta, time);
                break;
            case 'exiting':
                this._updateRedRoomTransitionOut();
                break;
        }
    }

    // Handles the transition into the Red Room.
    _updateRedRoomTransitionIn(delta) {
        this.redRoomTransitionTimer += delta;
        const progress = Math.min(this.redRoomTransitionTimer / 8.0, 1.0); // 8-second transition

        // Warp the camera and flicker lights for a disorienting effect.
        this.camera.fov = 75 + Math.sin(progress * Math.PI) * 25;
        this.camera.rotation.z = Math.sin(progress * Math.PI * 2) * 0.1;
        this.camera.updateProjectionMatrix();

        state.flickeringLights.forEach(light => {
            if (Math.random() > 0.5) {
                light.intensity = Math.random() * 40;
            }
        });

        // Finalize the transition.
        if (progress >= 1.0) {
            state.setRedRoomState('active');
            this.controls.teleport(new THREE.Vector3(0, 4, 0));
            if(state.redRoom) state.redRoom.visible = true;
            this.redRoomTransitionTimer = 0; // Reset timer for use inside the room
        }
    }

    // Handles the main logic while the player is inside the Red Room.
    _updateRedRoomActive(delta, time) {
        this.redRoomTransitionTimer += delta;

        // Slow down the player's movement.
        state.setMovementSpeed(10);

        // The Man From Another Place appears and does a disjointed dance.
        if (this.redRoomTransitionTimer > 4.0 && state.redRoomMan) {
            state.redRoomMan.visible = true;
            state.redRoomMan.position.y = Math.sin(time * 2) * 0.15;
        }

        // After a set time, end the sequence.
        if (this.redRoomTransitionTimer > 12.0) {
            state.setRedRoomState('exiting');
        }
    }

    // Handles the transition out of the Red Room.
    _updateRedRoomTransitionOut() {
        // Hide the Red Room and fade out its audio.
        if(state.redRoom) state.redRoom.visible = false;
        manageRedRoomAudio(false);

        // Reset camera and player speed.
        this.camera.fov = 75;
        this.camera.rotation.z = 0;
        this.camera.updateProjectionMatrix();
        state.setMovementSpeed(50);

        // Teleport the player back to the diner.
        this.controls.teleport(new THREE.Vector3(40, 4, -490));

        // Update the jukebox to indicate the coin has been returned.
        const jukeInteractable = state.interactables.find(i => i.mesh === state.jukebox);
        if (jukeInteractable) {
            jukeInteractable.prompt = "The coin is in the rejection slot.";
        }

        // Deactivate the Red Room state.
        state.setRedRoomState('inactive');
    }
 
 
     // The main update loop, called on every frame.
     animate() {
         requestAnimationFrame(() => this.animate());
         const delta = state.clock.getDelta();
         const time = state.clock.getElapsedTime();
 
         this.controls.update(delta);
         
         // Update major game sequences
         this.updateLodge(delta, time);
         this.updateRedRoom(delta, time);
         this.updateCasino(delta, time);
         
         // Update individual systems and actors
         this._updateCatStateMachine(delta, time);
         
         if (state.isRocketRideActive) {
             this._updateRocketRide(delta);
         }
 
         this._updateFlickeringLights();
         this._updateDoors(delta);
         this._updateMDT(delta);
 
         this.renderer.render(this.scene, this.camera);
     }
 
     // Handles the state machine for the mysterious cat entity.
     _updateCatStateMachine(delta, time) {
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
                     const redEyeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 2, toneMapped: false });
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
 
                 // Once the Cat-Moon is watching, the rocket becomes active.
                 const rocketInteractable = state.interactables.find(i => i.mesh === state.rocket);
                 if (rocketInteractable && rocketInteractable.prompt.includes("inert")) {
                     rocketInteractable.prompt = "The rocket hums with a strange energy. Climb aboard?";
                     rocketInteractable.onInteract = () => {
                         if (state.catState === 'watching') {
                             console.log("Beginning rocket ride sequence.");
                             state.setIsPlayerInRocket(true);
                             state.setIsRocketRideActive(true);
                         }
                     };
                 }
                 break;
         }
     }
 
     // Handles the flickering effect of certain lights in the scene.
     _updateFlickeringLights() {
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
     }
 
     // Updates all interactive doors.
     _updateDoors(delta) {
         state.doors.forEach(door => door.update(delta));
     }

    _updateRocketRide(delta) {
        if (!state.isPlayerInRocket) return;

        const rocket = state.rocket;
        const catMoon = state.catMoon;

        if (!rocket || !catMoon) {
            state.setIsRocketRideActive(false);
            state.setIsPlayerInRocket(false);
            return;
        }

        // Lock player view
        this.controls.controls.unlock(); // Force unlock to prevent mouse movement
        
        const targetPosition = catMoon.position.clone().add(new THREE.Vector3(0, -60, 0)); // Land slightly below the moon center
        const journeyTime = 15; // 15 second flight
        
        const progress = Math.min(state.clock.getElapsedTime() / journeyTime, 1.0);

        // Move rocket
        rocket.position.lerp(targetPosition, delta * 0.1);
        rocket.lookAt(catMoon.position);

        // Move camera with rocket
        const cameraOffset = new THREE.Vector3(0, 5, 10); // Position camera behind the rocket
        const cameraTarget = new THREE.Vector3().copy(rocket.position).add(cameraOffset);
        this.camera.position.lerp(cameraTarget, 0.1);
        this.camera.lookAt(rocket.position);

        if (rocket.position.distanceTo(targetPosition) < 1) {
            console.log("Landing sequence complete.");
            state.setIsRocketRideActive(false);
            // Player can now disembark, but for now we just end the sequence.
            // In a future step, we would create a landing pad and allow movement.
        }
    }

    // Manages the Mobile Diagnostic Tool's state, power, and visual effects.
    _updateMDT(delta) {
        const mdt = state.mdt;
        if (!mdt.light) return;

        if (mdt.isOvercharging) {
            this._handleMDTOvercharge(delta);
            return;
        }

        if (mdt.isOn && mdt.powerCell > 0) {
            this._handleMDTActive(delta);
        } else {
            this._handleMDTOff();
        }

        if (mdt.powerCell < 0) {
            mdt.powerCell = 0;
        }
    }

    // Handles the overcharge state, a temporary power boost that quickly drains the cell.
    _handleMDTOvercharge(delta) {
        const mdt = state.mdt;
        mdt.overchargeTimer -= delta;

        if (mdt.overchargeTimer > 0) {
            mdt.light.visible = true;
            mdt.light.intensity = 2.0; // Max intensity burst
            mdt.light.angle = mdt.mode === 'diagnostic' ? Math.PI / 16 : Math.PI / 7;
            mdt.light.color.setHex(0xff8888); // Reddish-white to show strain
        } else {
            mdt.isOvercharging = false;
            mdt.overchargeTimer = 0;
            this._handleMDTOff(); // Turn off completely after overcharge
        }
    }

    // Handles the normal active state, draining power and updating visuals.
    _handleMDTActive(delta) {
        const mdt = state.mdt;
        mdt.light.visible = true;

        // Drain power based on the current mode.
        const drainMultiplier = mdt.mode === 'diagnostic' ? 5 : 1;
        mdt.powerCell -= (5 * drainMultiplier) * delta;

        // Update visual properties based on remaining power.
        this._updateMDTVisuals(mdt.powerCell / 100);

        // Mode-specific beam angle.
        mdt.light.angle = mdt.mode === 'diagnostic' ? Math.PI / 16 : Math.PI / 7;
    }

    // Updates the light's intensity, color, and flicker based on the power ratio.
    _updateMDTVisuals(powerRatio) {
        const mdt = state.mdt;
        const baseIntensity = powerRatio * 1.5;

        // Beam becomes less focused as power drops.
        mdt.light.penumbra = 0.4 + (1 - powerRatio) * 0.4;

        // Color shifts from white to cyan as power drains.
        mdt.beamColor.set(0xffffff).lerp(new THREE.Color(0x99ffff), 1 - powerRatio);
        mdt.light.color = mdt.beamColor;

        // Light flickers at low power.
        if (powerRatio < 0.2) {
            mdt.light.intensity = Math.random() > 0.9 ? baseIntensity * Math.random() * 0.5 : baseIntensity;
        } else {
            mdt.light.intensity = baseIntensity;
        }
    }

    // Turns the MDT light off.
    _handleMDTOff() {
        const mdt = state.mdt;
        mdt.isOn = false;
        mdt.light.visible = false;
        mdt.light.intensity = 0;
    }
 
    // Manages all logic related to the Velvet Hand Casino sequence.
    updateCasino(delta, time) {
        switch (state.casinoState) {
            case 'active':
                // Logic for when the player is in the casino
                break;
            case 'jackpot':
                this._updateCasinoJackpot(delta, time);
                break;
            case 'woodsman':
                this._updateCasinoWoodsman(delta, time);
                break;
        }
    }

    _updateCasinoJackpot(delta, time) {
       manageCasinoAudio(false); // Silence
       console.log("The air grows cold. A single, scorched cigarette butt is dispensed.");
       if (state.slotMachine && state.slotMachine.userData.cigaretteButt) {
           state.slotMachine.userData.cigaretteButt.visible = true;
       }
       state.setCasinoState('woodsman');
    }

    _updateCasinoWoodsman(delta, time) {
       if (!state.woodsman) {
           return;
       }

       if (state.casinoState === 'woodsman' && !state.woodsman.visible) {
           state.woodsman.visible = true;
           // Make sure the interior is visible too
           if (state.velvetHandCasino) {
               const interior = state.velvetHandCasino.children.find(child => child.name === 'interior');
               if (interior) {
                   interior.visible = true;
               }
           }
       }

       // Stop-motion movement
       if (Math.random() < 0.1) {
           const cameraDirection = new THREE.Vector3();
           this.camera.getWorldDirection(cameraDirection);
           const behindPosition = this.camera.position.clone().add(cameraDirection.multiplyScalar(-8));
           state.woodsman.position.copy(behindPosition);
           state.woodsman.lookAt(this.camera.position);
       }

       // Flickering lights and dialogue
       if (Math.random() < 0.05) {
           console.log("Got a light?");
           state.velvetHandCasino.children.forEach(child => {
               if (child.isPointLight) {
                   child.intensity = Math.random() * 2;
               }
           });
       }
    }
}