// js/VelvetHandCasino.js
// This is where the dream becomes a reality. We build the casino here.

import * as THREE from 'three';
import { createChevronFloorTexture, createVelvetCurtainTexture, createSlotMachineTexture, createBlackjackCardTexture, createRouletteSymbolTexture, createNeonSignTexture } from './textures.js';
import { colliders, interactables, setCasinoState, setSlotMachine, setWoodsman, doors, setVelvetHandCasino } from './state.js';
import { playSlotMachineSpin, manageCasinoAudio, playBlackjackCardSound, playRouletteWheelSpinSound } from './audio.js';
import { Door } from './Door.js';
import * as state from './state.js';

// --- CASINO CREATION ---

/**
 * Creates the main group for the Velvet Hand Casino scene.
 * @param {THREE.Scene} scene The main scene to add the casino to.
 * @returns {THREE.Group} The casino group object.
 */
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export function createVelvetHandCasino(scene, gameLoop) {
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
    const neonTexture = createNeonSignTexture('VELVET HAND');
    const neonMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff, map: neonTexture, transparent: true });
    const signWidth = 12;
    const signHeight = 3;
    const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(signWidth, signHeight), neonMaterial);
    textMesh.position.set(0, 9, 25.2);
    casinoGroup.add(textMesh);

    const signLight = new THREE.PointLight(0xff00ff, 20, 30, 2);
    signLight.position.set(0, 8, 28);
    casinoGroup.add(signLight);

    // --- Interior ---
    const interiorGroup = new THREE.Group();
    interiorGroup.name = 'interior';
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

    // Walls (Velvet Curtains)
    const curtainTexture = createVelvetCurtainTexture(true);
    const wallMaterial = new THREE.MeshStandardMaterial({
        map: curtainTexture,
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0.1
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
    state.flickeringLights.push(blueLight);

    const redLight = new THREE.PointLight(0xff0000, 1.5, 50, 2);
    redLight.position.set(15, roomHeight - 2, 15);
    interiorGroup.add(redLight);
    state.flickeringLights.push(redLight);

    const yellowLight = new THREE.PointLight(0xffff00, 1.5, 50, 2);
    yellowLight.position.set(0, roomHeight - 2, 0);
    interiorGroup.add(yellowLight);
    state.flickeringLights.push(yellowLight);

    // --- Slot Machine ---
    createOneArmedDreamer(interiorGroup);

    // --- Woodsman ---
    createWoodsman(interiorGroup);

    // --- Expansion Content ---
    createNeonSigns(interiorGroup);
    createBlackjackTable(interiorGroup);
    createRouletteTable(interiorGroup);
    createPatrons(interiorGroup);


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
 * Creates the new neon signs for the casino.
 * @param {THREE.Group} parentGroup The group to add the signs to.
 */
function createNeonSigns(parentGroup) {
    const signs = [
        { text: "PAYOUTS IN REGRET", color: 0x00ff00, position: new THREE.Vector3(-15, 10, -24.8), rotation: 0, width: 18, height: 4 },
        { text: "THE HOUSE ALWAYS WINS", subtitle: "(YOUR SOUL)", color: 0xff00ff, position: new THREE.Vector3(15, 10, -24.8), rotation: 0, width: 18, height: 4 },
        { text: "CHECK YOUR REFLECTION", color: 0x00ff00, position: new THREE.Vector3(24.8, 10, 0), rotation: -Math.PI / 2, width: 18, height: 4 },
        { text: "TIME IS A FLAT CIRCLE", subtitle: "(OF DEBT)", color: 0xff00ff, position: new THREE.Vector3(-24.8, 10, 0), rotation: Math.PI / 2, width: 18, height: 4 }
    ];

    signs.forEach(signInfo => {
        const texture = createNeonSignTexture(signInfo.text, signInfo.subtitle);
        const material = new THREE.MeshBasicMaterial({
            color: signInfo.color,
            map: texture,
            transparent: true,
            alphaTest: 0.5 // Discard transparent pixels
        });

        const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(signInfo.width, signInfo.height), material);
        signMesh.position.copy(signInfo.position);
        signMesh.rotation.y = signInfo.rotation;
        parentGroup.add(signMesh);

        const signLight = new THREE.PointLight(signInfo.color, 8, 25, 2);
        signLight.position.copy(signInfo.position);
        parentGroup.add(signLight);
    });
}


/**
 * Creates the Blackjack table.
 * @param {THREE.Group} parentGroup The group to add the table to.
 */
function createBlackjackTable(parentGroup) {
    const blackjackGroup = new THREE.Group();
    blackjackGroup.position.set(15, 0, -10);
    parentGroup.add(blackjackGroup);

    // Table
    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.5, 32, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x003300 }));
    tableTop.position.y = 3.5;
    tableTop.rotation.y = Math.PI / 2;
    blackjackGroup.add(tableTop);
    colliders.push(tableTop);

    // Dealer (Mannequin)
    const dealerMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });
    const dealerBody = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 2), dealerMaterial);
    dealerBody.position.set(0, 1.5, 4);
    blackjackGroup.add(dealerBody);

    const dealerHead = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), dealerMaterial);
    dealerHead.position.set(0, 4, 4);
    blackjackGroup.add(dealerHead);

    // Cards
    const cardSymbols = ['weeping_eye', 'spiderweb', 'cracked_mirror', 'screaming_mouth'];
    const cards = [];
    for (let i = 0; i < 2; i++) {
        const cardSymbol = cardSymbols[Math.floor(Math.random() * cardSymbols.length)];
        const cardTexture = createBlackjackCardTexture(cardSymbol);
        const cardMaterial = new THREE.MeshBasicMaterial({ map: cardTexture });
        const card = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.5), cardMaterial);
        card.position.set(-2 + i * 2, 3.76, 2);
        blackjackGroup.add(card);
        cards.push(card);
    }

    const blackjackInteractable = {
        mesh: blackjackGroup,
        prompt: "A game of Blackjack? The dealer smiles.",
        onInteract: () => {
            playBlackjackCardSound();
            console.log("You play a hand of Blackjack.");
            // Simple game logic: just replace the cards
            cards.forEach(card => {
                const cardSymbol = cardSymbols[Math.floor(Math.random() * cardSymbols.length)];
                card.material.map = createBlackjackCardTexture(cardSymbol);
                card.material.needsUpdate = true;
            });
            const outcome = Math.random();
            if (outcome < 0.4) { // Lose
                blackjackInteractable.prompt = "You lose. The dealer's smile seems to widen.";
                // Trigger minor psychological penalty
            } else if (outcome < 0.9) { // Win
                blackjackInteractable.prompt = "You win. A fleeting sense of relief.";
            } else { // Blackjack
                blackjackInteractable.prompt = "Blackjack! A single, perfect tear rolls down the dealer's cheek.";
                // Give player a dead fly
            }
        }
    };
    interactables.push(blackjackInteractable);
}

/**
 * Creates the Roulette table.
 * @param {THREE.Group} parentGroup The group to add the table to.
 */
function createRouletteTable(parentGroup) {
    const rouletteGroup = new THREE.Group();
    rouletteGroup.position.set(-15, 0, -10);
    parentGroup.add(rouletteGroup);

    // Table
    const table = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 3.5, 32), new THREE.MeshStandardMaterial({ color: 0x4a2c2a }));
    table.position.y = 1.75;
    rouletteGroup.add(table);
    colliders.push(table);

    // Roulette Wheel
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.5, 64), wheelMaterial);
    wheel.position.y = 3.75;
    rouletteGroup.add(wheel);

    // Symbols
    const symbols = ['serpent', 'broken_crown', 'empty_throne', 'black_star'];
    for (let i = 0; i < 16; i++) {
        const symbol = symbols[i % symbols.length];
        const texture = createRouletteSymbolTexture(symbol);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), material);
        const angle = (i / 16) * Math.PI * 2;
        plane.position.set(Math.cos(angle) * 3.5, 4.01, Math.sin(angle) * 3.5);
        plane.rotation.x = -Math.PI / 2;
        plane.rotation.z = -angle;
        rouletteGroup.add(plane);
    }

    // Eyeball
    const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    eyeball.position.y = 4.1;
    rouletteGroup.add(eyeball);

    const rouletteInteractable = {
        mesh: rouletteGroup,
        prompt: "A strange roulette wheel. An eyeball rests in the center.",
        onInteract: () => {
            playRouletteWheelSpinSound();
            console.log("The eyeball spins around the wheel.");
            // Spin animation
            let spinTime = 0;
            const spinDuration = 3; // seconds
            const startAngle = eyeball.position.x;
            const endAngle = Math.random() * Math.PI * 2 * 4; // Spin a few times
            function animateSpin(time) {
                if (!animateSpin.lastTime) animateSpin.lastTime = time;
                const deltaTime = (time - animateSpin.lastTime) / 1000;
                animateSpin.lastTime = time;

                spinTime += deltaTime;
                if (spinTime < spinDuration) {
                    const progress = spinTime / spinDuration;
                    const angle = startAngle + (endAngle - startAngle) * progress;
                    eyeball.position.x = Math.cos(angle) * 3.5;
                    eyeball.position.z = Math.sin(angle) * 3.5;
                    requestAnimationFrame(animateSpin);
                } else {
                    animateSpin.lastTime = undefined;
                    const finalAngle = endAngle % (Math.PI * 2);
                    const winningSymbolIndex = Math.floor((finalAngle / (Math.PI * 2)) * 16);
                    const winningSymbol = symbols[winningSymbolIndex % symbols.length];
                    rouletteInteractable.prompt = `The eyeball lands on the ${winningSymbol.replace('_', ' ')}.`;
                    // Trigger consequence based on symbol
                }
            }
            requestAnimationFrame(animateSpin);
        }
    };
    interactables.push(rouletteInteractable);
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

    const woodsmanState = {
        casinoLights: null,
        timers: [],
        flickerTimers: [],
        markedMessage: null,
        markedLight: null
    };

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2, 8, 2), bodyMaterial);
    body.position.y = 4;
    woodsman.add(body);

    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee, emissive: 0xffffff, emissiveIntensity: 0.1 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), headMaterial);
    head.position.y = 9;
    woodsman.add(head);

    const markedTexture = createNeonSignTexture('THE FIRE REMEMBERS');
    const markedMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, map: markedTexture, transparent: true });
    const markedMessage = new THREE.Mesh(new THREE.PlaneGeometry(12, 3), markedMaterial);
    markedMessage.position.set(0, 9, 8);
    markedMessage.visible = false;
    parentGroup.add(markedMessage);
    woodsmanState.markedMessage = markedMessage;

    const markedLight = new THREE.PointLight(0xff0000, 0, 30, 2);
    markedLight.position.copy(markedMessage.position).add(new THREE.Vector3(0, 1, 0));
    parentGroup.add(markedLight);
    woodsmanState.markedLight = markedLight;

    const rememberLight = (light) => {
        if (light.userData.originalIntensity === undefined) {
            light.userData.originalIntensity = light.intensity;
        }
        if (light.userData.originalVisible === undefined) {
            light.userData.originalVisible = light.visible;
        }
    };

    const cacheCasinoLights = () => {
        if (woodsmanState.casinoLights) return woodsmanState.casinoLights;
        const lightSet = new Set();
        parentGroup.traverse(child => {
            if (child.isLight) {
                lightSet.add(child);
            }
        });
        state.flickeringLights.forEach(light => lightSet.add(light));
        woodsmanState.casinoLights = Array.from(lightSet);
        woodsmanState.casinoLights.forEach(rememberLight);
        return woodsmanState.casinoLights;
    };

    const clearTimers = () => {
        woodsmanState.timers.forEach(timer => clearTimeout(timer));
        woodsmanState.timers = [];
        woodsmanState.flickerTimers.forEach(timer => clearInterval(timer));
        woodsmanState.flickerTimers = [];
    };

    const showMarkedMessage = (visible) => {
        if (woodsmanState.markedMessage) woodsmanState.markedMessage.visible = visible;
        if (woodsmanState.markedLight) {
            woodsmanState.markedLight.visible = visible;
            woodsmanState.markedLight.intensity = visible ? 12 : 0;
        }
    };

    const setLightsMultiplier = (multiplier) => {
        cacheCasinoLights();
        woodsmanState.casinoLights.forEach(light => {
            rememberLight(light);
            light.visible = true;
            light.intensity = (light.userData.originalIntensity || light.intensity) * multiplier;
        });
    };

    const blackoutLights = () => {
        cacheCasinoLights();
        woodsmanState.casinoLights.forEach(light => {
            rememberLight(light);
            light.visible = true;
            light.intensity = 0;
        });
    };

    const restoreLights = () => {
        cacheCasinoLights();
        woodsmanState.casinoLights.forEach(light => {
            rememberLight(light);
            light.visible = light.userData.originalVisible !== undefined ? light.userData.originalVisible : true;
            light.intensity = light.userData.originalIntensity !== undefined ? light.userData.originalIntensity : light.intensity;
        });
    };

    const startFlicker = (strength) => {
        cacheCasinoLights();
        const flicker = () => {
            woodsmanState.casinoLights.forEach(light => {
                rememberLight(light);
                const base = light.userData.originalIntensity || 1;
                light.intensity = Math.max(0, base * (0.2 + Math.random() * strength));
            });
        };
        flicker();
        const interval = setInterval(flicker, 120);
        woodsmanState.flickerTimers.push(interval);
        woodsmanState.timers.push(setTimeout(() => clearInterval(interval), 1200 + strength * 200));
    };

    const silenceCasino = () => manageCasinoAudio(false);
    const restoreCasinoAudio = () => manageCasinoAudio(true);

    const concludeEncounter = () => {
        clearTimers();
        restoreLights();
        restoreCasinoAudio();
        showMarkedMessage(false);
        woodsman.visible = false;
        setCasinoState('active');
    };

    const handleMemoryTaken = () => {
        blackoutLights();
        woodsmanState.timers.push(setTimeout(() => {
            state.setHasMemoryOfFace(true);
            restoreLights();
            concludeEncounter();
            state.setWoodsmanPromptCount(0);
            woodsmanInteractable.prompt = "Got a light?";
        }, 900));
    };

    const handleLighterGift = () => {
        blackoutLights();
        showMarkedMessage(true);
        state.setPlayerHasLighter(false);
        state.setIsWoodsmanMarked(true);
        state.setWoodsmanPromptCount(0);
        woodsmanInteractable.prompt = "Your flame is gone. His mouth glows scarlet.";
        woodsmanState.timers.push(setTimeout(() => {
            concludeEncounter();
        }, 2500));
    };

    const handleNoLighter = () => {
        const promptCount = state.woodsmanPromptCount + 1;
        state.setWoodsmanPromptCount(promptCount);
        startFlicker(promptCount + 1);
        setLightsMultiplier(0.25 + promptCount * 0.2);
        woodsmanInteractable.prompt = promptCount >= 3 ? "His whisper is inches away." : "Got a light?";

        const darknessDelay = 1400 + promptCount * 300;
        woodsmanState.timers.push(setTimeout(() => {
            blackoutLights();
            if (promptCount >= 3) {
                handleMemoryTaken();
            } else {
                woodsmanState.timers.push(setTimeout(() => {
                    restoreLights();
                    restoreCasinoAudio();
                    woodsman.visible = false;
                    setCasinoState('active');
                    woodsmanState.timers.push(setTimeout(() => setCasinoState('woodsman'), 2500));
                }, 800));
            }
        }, darknessDelay));
    };

    const woodsmanInteractable = {
        mesh: woodsman,
        prompt: "Got a light?",
        onInteract: () => {
            clearTimers();
            showMarkedMessage(false);
            restoreLights();
            silenceCasino();
            setCasinoState('woodsman');
            woodsman.visible = true;
            startFlicker(state.woodsmanPromptCount + 1);

            if (state.playerHasLighter) {
                handleLighterGift();
            } else if (state.isWoodsmanMarked) {
                woodsmanInteractable.prompt = "The mark burns. He does not need your flame again.";
                woodsmanState.timers.push(setTimeout(() => concludeEncounter(), 1500));
            } else {
                handleNoLighter();
            }
        }
    };
    interactables.push(woodsmanInteractable);
}

/**
 * Creates the uncanny patrons of the casino.
 * @param {THREE.Group} parentGroup The group to add the patrons to.
 */
function createPatrons(parentGroup) {
    const patronMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });

    // Patron 1: Woman at a slot machine
    const patron1 = new THREE.Group();
    patron1.position.set(-10, 0, -15);
    parentGroup.add(patron1);
    const body1 = new THREE.Mesh(new THREE.BoxGeometry(2, 5, 2), patronMaterial);
    body1.position.y = 2.5;
    patron1.add(body1);
    const head1 = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), patronMaterial);
    head1.position.y = 5.5;
    patron1.add(head1);

    // Patron 2: Man with a martini
    const patron2 = new THREE.Group();
    patron2.position.set(10, 0, 15);
    parentGroup.add(patron2);
    const body2 = new THREE.Mesh(new THREE.BoxGeometry(2, 5, 2), patronMaterial);
    body2.position.y = 2.5;
    patron2.add(body2);
    const head2 = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), patronMaterial);
    head2.position.y = 5.5;
    patron2.add(head2);
}
