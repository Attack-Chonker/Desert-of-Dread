// js/VelvetHandCasino.js
// This is where the dream becomes a reality. We build the casino here.

import * as THREE from 'three';
import { createChevronFloorTexture, createVelvetCurtainTexture, createSlotMachineTexture } from './textures.js';
import { colliders, interactables, setCasinoState, setSlotMachine, setWoodsman, playerHasLighter, doors, setVelvetHandCasino } from './state.js';
import { playSlotMachineSpin, manageCasinoAudio } from './audio.js';
import { Door } from './Door.js';

// --- CASINO CREATION ---

/**
 * Creates the main group for the Velvet Hand Casino scene.
 * @param {THREE.Scene} scene The main scene to add the casino to.
 * @returns {THREE.Group} The casino group object.
 */
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export function createVelvetHandCasino(scene, gameLoop, font) {
    const casinoGroup = new THREE.Group();
    casinoGroup.position.set(-50, 0, -500); // Position it on the main road
    scene.add(casinoGroup);
    setVelvetHandCasino(casinoGroup);

    // --- Exterior ---
    const exteriorMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const exterior = new THREE.Mesh(new THREE.BoxGeometry(50, 12, 50), exteriorMaterial);
    exterior.position.y = 6;
    casinoGroup.add(exterior);
    // The door will be a separate interactable, so we don't add the whole exterior to colliders.

    const door = new Door(false, 4, 7, new THREE.MeshStandardMaterial({ color: 0x8B0000 }), new THREE.Vector3(0, 3.5, 25.1));
    door.addToScene(casinoGroup);
    doors.push(door);

    door.interactable.prompt = "A heavy, red door. There is no handle.";
    door.interactable.onInteract = () => {
        interiorGroup.visible = true;
        exterior.visible = false;
        gameLoop.controls.teleport(new THREE.Vector3(-50, 4, -490));
        setCasinoState('active');
        manageCasinoAudio(true);
    };

    // Neon Sign
    const neonMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const textSettings = { font: font, size: 2, depth: 0.2 };
    const textGeo = new TextGeometry('VELVET HAND', textSettings);
    textGeo.computeBoundingBox();
    const textWidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;
    const textMesh = new THREE.Mesh(textGeo, neonMaterial);
    textMesh.position.set(-textWidth / 2, 8, 25.5);
    casinoGroup.add(textMesh);

    const signLight = new THREE.PointLight(0xff00ff, 20, 30, 2);
    signLight.position.set(0, 8, 28);
    casinoGroup.add(signLight);

    // --- Interior ---
    const interiorGroup = new THREE.Group();
    interiorGroup.visible = false; // Start with the interior hidden
    casinoGroup.add(interiorGroup);

    // --- Basic Geometry ---
    const roomWidth = 50, roomDepth = 50, roomHeight = 12;

    // Floor
    const floorMaterial = new THREE.MeshStandardMaterial({ map: createChevronFloorTexture() });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomDepth), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    interiorGroup.add(floor);

    // Walls (Chrome)
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.9,
        roughness: 0.2
    });

    const wall1 = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomHeight), wallMaterial);
    wall1.position.set(0, roomHeight / 2, -roomDepth / 2);
    interiorGroup.add(wall1);

    const wall2 = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomHeight), wallMaterial);
    wall2.position.set(-roomWidth / 2, roomHeight / 2, 0);
    wall2.rotation.y = Math.PI / 2;
    interiorGroup.add(wall2);

    const wall3 = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomHeight), wallMaterial);
    wall3.position.set(0, roomHeight / 2, roomDepth / 2);
    wall3.rotation.y = Math.PI;
    interiorGroup.add(wall3);

    const wall4 = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomHeight), wallMaterial);
    wall4.position.set(roomWidth / 2, roomHeight / 2, 0);
    wall4.rotation.y = -Math.PI / 2;
    interiorGroup.add(wall4);

    // --- Lighting ---
    // Sickly green and magenta neons
    const blueLight = new THREE.PointLight(0x0000ff, 1.5, 50, 2);
    blueLight.position.set(-15, roomHeight - 2, -15);
    interiorGroup.add(blueLight);

    const redLight = new THREE.PointLight(0xff0000, 1.5, 50, 2);
    redLight.position.set(15, roomHeight - 2, 15);
    interiorGroup.add(redLight);

    const yellowLight = new THREE.PointLight(0xffff00, 1.5, 50, 2);
    yellowLight.position.set(0, roomHeight - 2, 0);
    interiorGroup.add(yellowLight);

    // --- Slot Machine ---
    createOneArmedDreamer(interiorGroup);

    // --- Woodsman ---
    createWoodsman(interiorGroup);

    return casinoGroup;
}

/**
 * Creates "The One-Armed Dreamer" slot machine.
 * @param {THREE.Group} parentGroup The group to add the slot machine to.
 */
function createOneArmedDreamer(parentGroup) {
    const slotMachine = new THREE.Group();
    slotMachine.position.set(0, 0, -20);
    parentGroup.add(slotMachine);

    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.9,
        roughness: 0.2
    });

    const body = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 3), bodyMaterial);
    body.position.y = 3;
    body.castShadow = true;
    slotMachine.add(body);
    colliders.push(body);

    // Screen
    const screenMaterial = new THREE.MeshBasicMaterial({ map: createSlotMachineTexture() });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.5), screenMaterial);
    screen.position.set(0, 4, 1.51);
    slotMachine.add(screen);

    // Lever
    const leverArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 5, 8), bodyMaterial);
    leverArm.position.set(2.5, 4, 0);
    slotMachine.add(leverArm);

    const leverBall = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshStandardMaterial({ color: 0x8B0000 }));
    leverBall.position.y = 2.5;
    leverArm.add(leverBall);

    const slotMachineInteractable = {
        mesh: slotMachine,
        prompt: "An old slot machine. It feels cold.",
        onInteract: () => {
            playSlotMachineSpin();
            // 15% chance of winning
            if (Math.random() < 0.15) {
                console.log("JACKPOT!");
                slotMachineInteractable.prompt = "The machine falls silent.";
                setCasinoState('jackpot');
            } else {
                console.log("Nothing happens...");
                slotMachineInteractable.prompt = "The wheels spin, but stop on nothing of interest.";
            }
        }
    };
    interactables.push(slotMachineInteractable);
    setSlotMachine(slotMachine);

    // Cigarette butt
    const buttMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 });
    const butt = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8), buttMaterial);
    butt.position.set(0, 1, 2);
    butt.visible = false;
    slotMachine.add(butt);
    slotMachine.userData.cigaretteButt = butt;

    const buttInteractable = {
        mesh: butt,
        prompt: "A single, scorched cigarette butt.",
        onInteract: () => {
            if (butt.visible) {
                console.log("You pick up the cigarette butt.");
                butt.visible = false;
                setHasCigaretteButt(true);
                const index = interactables.indexOf(buttInteractable);
                if (index > -1) interactables.splice(index, 1);
            }
        }
    };
    interactables.push(buttInteractable);
}

/**
 * Creates the Woodsman entity.
 * @param {THREE.Group} parentGroup The group to add the Woodsman to.
 */
function createWoodsman(parentGroup) {
    const woodsman = new THREE.Group();
    woodsman.visible = false; // Start hidden
    woodsman.position.set(0, 0, 20); // Near the entrance
    parentGroup.add(woodsman);
    setWoodsman(woodsman);

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2, 8, 2), bodyMaterial);
    body.position.y = 4;
    woodsman.add(body);

    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee, emissive: 0xffffff, emissiveIntensity: 0.1 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), headMaterial);
    head.position.y = 9;
    woodsman.add(head);

    const woodsmanInteractable = {
        mesh: woodsman,
        prompt: "Got a light?",
        onInteract: () => {
            // This will be populated with the consequences of giving a light
            if (playerHasLighter) { // Assuming a state variable for the lighter
                console.log("You offer a light... The Woodsman inhales the flame. The world goes dark.");
                // Plunge into darkness, show message, etc.
                setCasinoState('inactive');
                woodsman.visible = false;
            } else {
                console.log("You have no light. The Woodsman leans closer... and the world tears.");
                // Player is "damaged", loses a memory, etc.
                setCasinoState('active'); // Return to a "normal" casino state
                woodsman.visible = false;
            }
        }
    };
    interactables.push(woodsmanInteractable);
}