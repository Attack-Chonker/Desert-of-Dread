// js/actors.js
// Here we give form to the formless. Every object in the world, from a humble cactus to the Man From Another Place, is born here.

import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { createNoise2D } from 'simplex-noise';
import { Door } from './Door.js';
import { createZigZagFloorTexture, createCurtainTexture, createBrickTexture } from './textures.js';
import { playMeow } from './audio.js';
import {
    colliders, doors, flickeringLights, setMoonLight, setMoon, setCat,
    setCatHead, setVoidPortal, setVoidLight, addTentacle, cat, interactables,
    roadhouseLights, setRoadhouseInterior, setBlackLodge, setLodgeStrobe,
    setFireplaceBacking, setLodgeMan, setLodgeStatue, setDoppelganger, setLauraDoppelganger,
    setRedRoomState, setJukebox, setRedRoom, setHasOwlCaveCoin, hasOwlCaveCoin, setRedRoomMan,
    canExitLodge, setCanExitLodge, setRocket, catState, setCatState
} from './state.js';
import { createCat as createOriginalCat, createVoidPortalAndTentacles, createTrashCans, createWaterTower, createTelephonePoles, createEnterableCar, createFace } from './actors-original.js';

export { createVoidPortalAndTentacles, createTrashCans, createWaterTower, createTelephonePoles, createEnterableCar, createFace };


// --- WORLD CREATION ---

export function createLightingAndWorld(scene) {
    const ambientLight = new THREE.AmbientLight(0x404050, 0.2);
    scene.add(ambientLight);
    const newMoonLight = new THREE.DirectionalLight(0x8a95a1, 0.6);
    newMoonLight.position.set(100, 200, 100);
    newMoonLight.castShadow = true;
    newMoonLight.shadow.mapSize.width = 2048;
    newMoonLight.shadow.mapSize.height = 2048;
    scene.add(newMoonLight);
    setMoonLight(newMoonLight);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), new THREE.MeshStandardMaterial({ color: 0x6b5a42 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const road = new THREE.Mesh(new THREE.PlaneGeometry(5000, 15), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, -470);
    road.receiveShadow = true;
    scene.add(road);
}

export function createStars(scene) {
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = THREE.MathUtils.randFloatSpread(3000);
        const y = THREE.MathUtils.randFloatSpread(3000);
        const z = THREE.MathUtils.randFloatSpread(3000);
        starVertices.push(x, y, z);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

export function createMoon(scene) {
    const moonSize = 50;
    const moonGeometry = new THREE.SphereGeometry(moonSize, 64, 64);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 512;
    context.fillStyle = '#f0f0e8';
    context.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = Math.random() * 30 + 5;
        const gray = Math.floor(Math.random() * 50 + 150);
        context.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${Math.random() * 0.5 + 0.2})`;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
    }
    const moonTexture = new THREE.CanvasTexture(canvas);
    const moonMaterial = new THREE.MeshStandardMaterial({
        map: moonTexture,
        emissive: 0xffffff,
        emissiveMap: moonTexture,
        emissiveIntensity: 0.8,
        transparent: true
    });
    const newMoon = new THREE.Mesh(moonGeometry, moonMaterial);
    newMoon.position.set(200, 300, -800);
    newMoon.rotation.y = Math.PI;
    scene.add(newMoon);
    setMoon(newMoon);
}

/**
 * Creates a procedural mountain range to surround the scene.
 * This is not just a mountain range. This is the Ghostwood. It watches.
 * @param {THREE.Scene} scene The scene to add the mountains to.
 */
export function createMountainRange(scene) {
    const noise = createNoise2D();

    // This function generates one side of the mountain range.
    // We will call it four times to completely encircle the world.
    function generateMountainSide(rotationY, position) {
        const geometry = new THREE.PlaneGeometry(4000, 1200, 200, 50);
        const material = new THREE.MeshStandardMaterial({
            color: 0x152520, // A dark, Twin Peaks, Douglas Fir green.
            roughness: 0.9,
            metalness: 0.1,
            side: THREE.FrontSide
        });

        const positions = geometry.attributes.position;
        const vertex = new THREE.Vector3();

        for (let i = 0; i < positions.count; i++) {
            vertex.fromBufferAttribute(positions, i);

            // We use multiple layers of noise (octaves) to create a more natural, complex terrain.
            // It's a secret recipe. A little from here, a little from there.
            const noiseScale = 800;
            const noise1 = noise(vertex.x / noiseScale, vertex.y / noiseScale) * 0.5;
            const noise2 = noise(vertex.x / (noiseScale * 0.3), vertex.y / (noiseScale * 0.3)) * 0.25;
            const noise3 = noise(vertex.x / (noiseScale * 0.1), vertex.y / (noiseScale * 0.1)) * 0.125;
            
            const totalNoise = noise1 + noise2 + noise3;
            
            const height = totalNoise * 1000; // The height of the peaks.

            // We apply the height to the z-axis because we will rotate the plane to be vertical.
            positions.setZ(i, height);
        }

        geometry.computeVertexNormals(); // Recalculate normals for correct lighting.

        const mountain = new THREE.Mesh(geometry, material);
        mountain.rotation.x = -Math.PI / 2; // Lay it flat first
        mountain.rotation.z = Math.PI;      // Flip it
        
        // Now position and rotate it into place.
        mountain.rotation.y = rotationY;
        mountain.position.copy(position);
        
        mountain.receiveShadow = true;
        mountain.castShadow = true; // Mountains can cast shadows from the moon
        scene.add(mountain);
    }

    // Create the four walls of our mountain prison.
    generateMountainSide(0, new THREE.Vector3(0, 0, -2000)); // Back
    generateMountainSide(Math.PI, new THREE.Vector3(0, 0, 2000)); // Front
    generateMountainSide(Math.PI / 2, new THREE.Vector3(-2000, 0, 0)); // Left
    generateMountainSide(-Math.PI / 2, new THREE.Vector3(2000, 0, 0)); // Right
}


export function createCat(scene) {
    createOriginalCat(scene); // This creates the cat and sets it in the state

    const catInteractable = {
        mesh: cat,
        prompt: "A cat is watching you.",
        onInteract: () => {
            // This logic will be expanded later to handle the ascension.
            // For now, it can just trigger the existing state machine if the player clicks on it.
            if (catState === 'idle') {
                playMeow();
                setCatState('approaching');
            }
        }
    };
    interactables.push(catInteractable);
}

export function createRocket(scene) {
    const rocket = new THREE.Group();
    rocket.position.set(200, 0, -600); // Behind the gas station
    scene.add(rocket);

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7, roughness: 0.5 });
    const accentMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000, roughness: 0.8 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.5, 15, 16), bodyMaterial);
    body.position.y = 7.5;
    body.castShadow = true;
    rocket.add(body);
    colliders.push(body);

    const noseCone = new THREE.Mesh(new THREE.ConeGeometry(2, 5, 16), bodyMaterial);
    noseCone.position.y = 15 + 2.5;
    noseCone.castShadow = true;
    rocket.add(noseCone);

    // Fins
    for (let i = 0; i < 3; i++) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 3), accentMaterial);
        const angle = (i / 3) * Math.PI * 2;
        fin.position.set(Math.cos(angle) * 2.5, 3, Math.sin(angle) * 2.5);
        fin.lookAt(rocket.position);
        fin.castShadow = true;
        rocket.add(fin);
    }

    const hatch = new THREE.Mesh(new THREE.CircleGeometry(1.5, 16), accentMaterial);
    hatch.position.set(0, 5, 2.55);
    rocket.add(hatch);

    const rocketInteractable = {
        mesh: rocket,
        prompt: "A dusty, old rocket. It seems inert.",
        onInteract: () => {
            // This will be populated later from the game loop
        }
    };
    interactables.push(rocketInteractable);

    setRocket(rocket);
    return rocket;
}

// --- BUILDING CREATION ---

export function createGasStation(scene, font) {
    const stationGroup = new THREE.Group();
    stationGroup.position.set(150, 0, -500);
    scene.add(stationGroup);

    stationGroup.traverse(function(child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    // A new aesthetic. One of time, dust, and secrets.
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.9, metalness: 0.1 }); // Faded beige paint
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.9 }); // Worn concrete
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.95, metalness: 0.3 }); // Rusty metal
    const redTrimMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000, roughness: 0.8 }); // Faded, dark red
    const glassMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaeb5, transparent: true, opacity: 0.4, roughness: 0.6 }); // Dirty glass

    // --- Main Building ---
    const buildingWidth = 40, buildingDepth = 25, buildingHeight = 10, wallThickness = 0.5;
    const building = new THREE.Group();
    stationGroup.add(building);

    const floor = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, wallThickness, buildingDepth), floorMaterial);
    floor.position.y = wallThickness / 2;
    building.add(floor);

    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, wallThickness, buildingDepth), roofMaterial);
    ceiling.position.y = buildingHeight - wallThickness / 2;
    building.add(ceiling);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, buildingHeight, wallThickness), wallMaterial);
    backWall.position.set(0, buildingHeight / 2, -buildingDepth / 2);
    building.add(backWall);
    colliders.push(backWall);

    // The original left wall is replaced by the new garage.
    // const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, buildingHeight, buildingDepth), wallMaterial);
    // leftWall.position.set(-buildingWidth / 2, buildingHeight / 2, 0);
    // building.add(leftWall);
    // colliders.push(leftWall);

    // Front Wall with large window
    const frontWindowWidth = 25;
    const frontSideWallWidth = (buildingWidth - frontWindowWidth) / 2;
    const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(frontSideWallWidth, buildingHeight, wallThickness), wallMaterial);
    frontWallLeft.position.set(-buildingWidth/2 + frontSideWallWidth/2, buildingHeight/2, buildingDepth/2);
    building.add(frontWallLeft);
    colliders.push(frontWallLeft);

    const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(frontSideWallWidth, buildingHeight, wallThickness), wallMaterial);
    frontWallRight.position.set(buildingWidth/2 - frontSideWallWidth/2, buildingHeight/2, buildingDepth/2);
    building.add(frontWallRight);
    colliders.push(frontWallRight);

    const frontWallTop = new THREE.Mesh(new THREE.BoxGeometry(frontWindowWidth, 1, wallThickness), wallMaterial);
    frontWallTop.position.set(0, buildingHeight - 0.5, buildingDepth/2);
    building.add(frontWallTop);
    colliders.push(frontWallTop);
    
    const frontWindow = new THREE.Mesh(new THREE.PlaneGeometry(frontWindowWidth, buildingHeight - 1), glassMaterial);
    frontWindow.position.set(0, (buildingHeight - 1)/2, buildingDepth/2);
    building.add(frontWindow);

    // Right wall with door
    const doorWidth = 4, doorHeight = 7;
    const rightWallBack = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, buildingHeight, buildingDepth/2 - doorWidth/2), wallMaterial);
    rightWallBack.position.set(buildingWidth/2, buildingHeight/2, -buildingDepth/4 - doorWidth/4);
    building.add(rightWallBack);
    colliders.push(rightWallBack);

    const rightWallFront = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, buildingHeight, buildingDepth/2 - doorWidth/2), wallMaterial);
    rightWallFront.position.set(buildingWidth/2, buildingHeight/2, buildingDepth/4 + doorWidth/4);
    building.add(rightWallFront);
    colliders.push(rightWallFront);

    const rightWallTop = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, buildingHeight - doorHeight, doorWidth), wallMaterial);
    rightWallTop.position.set(buildingWidth/2, doorHeight + (buildingHeight - doorHeight)/2, 0);
    building.add(rightWallTop);
    colliders.push(rightWallTop);

    const buildingDoor = new Door(false, doorWidth, doorHeight, new THREE.MeshStandardMaterial({color: 0x555555}), new THREE.Vector3(buildingWidth/2, doorHeight/2, 0));
    buildingDoor.addToScene(building);
    doors.push(buildingDoor);

    // Red trim on building
    const buildingTrim = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth + 0.2, 1, buildingDepth + 0.2), redTrimMaterial);
    buildingTrim.position.y = buildingHeight;
    building.add(buildingTrim);

    // Interior Office
    const office = new THREE.Group();
    building.add(office);

    const desk = new THREE.Mesh(new THREE.BoxGeometry(8, 3, 4), new THREE.MeshStandardMaterial({ color: 0x654321 }));
    desk.position.set(-buildingWidth / 2 + 5, 1.5, -buildingDepth/2 + 4);
    office.add(desk);
    colliders.push(desk);

    const chair = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 2), new THREE.MeshStandardMaterial({ color: 0x3d2c1a }));
    chair.position.set(-buildingWidth / 2 + 5, 2, -buildingDepth/2 + 8);
    office.add(chair);
    colliders.push(chair);

    const shelf = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 2), new THREE.MeshStandardMaterial({ color: 0x654321 }));
    shelf.position.set(0, 6, -buildingDepth/2 + 1);
    office.add(shelf);

    // Back room
    const backRoomDoor = new Door(false, 4, 7, new THREE.MeshStandardMaterial({color: 0x3d2c1a}), new THREE.Vector3(buildingWidth/2 - 10, 3.5, -buildingDepth/2 + 0.25));
    backRoomDoor.addToScene(building);
    doors.push(backRoomDoor);
    backRoomDoor.setLocked(true);

    const messageMaterial = new THREE.MeshBasicMaterial({ color: 0x8B0000 });
    const messageGeo = new TextGeometry("FIRE WALK WITH ME", { font: font, size: 0.5, depth: 0.1 });
    const message = new THREE.Mesh(messageGeo, messageMaterial);
    message.position.set(buildingWidth / 2 - 12, 5, -buildingDepth / 2 + 0.5);
    message.rotation.y = Math.PI;
    building.add(message);

    const diary = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.7), new THREE.MeshStandardMaterial({ color: 0x000000 }));
    diary.position.set(-buildingWidth / 2 + 2, 3.2, -buildingDepth / 2 + 4);
    office.add(diary);

    const diaryInteractable = {
        mesh: diary,
        prompt: "There's a small book here.",
        onInteract: () => {
            diaryInteractable.prompt = "The pages are filled with strange symbols and reversed writing.";
        }
    };
    interactables.push(diaryInteractable);

    // The key to another place.
    const coinGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
    const coinMat = new THREE.MeshStandardMaterial({color: 0x1a1a1a, metalness: 0.8, roughness: 0.2});
    const owlCaveCoin = new THREE.Mesh(coinGeo, coinMat);
    owlCaveCoin.position.set(-buildingWidth / 2 + 2.5, 3.2, -buildingDepth / 2 + 4.5); // Next to the diary
    owlCaveCoin.rotation.x = Math.PI / 2;
    office.add(owlCaveCoin);

    const coinInteractable = {
        mesh: owlCaveCoin,
        prompt: "A strange, heavy coin. It feels cold.",
        onInteract: () => {
            setHasOwlCaveCoin(true);
            owlCaveCoin.visible = false;
            const index = interactables.indexOf(coinInteractable);
            if (index > -1) interactables.splice(index, 1);
            // We don't change the prompt because the object will be gone.
        }
    };
    interactables.push(coinInteractable);
 
     const interiorLight = new THREE.RectAreaLight(0xbdeeff, 2, 30, 20); // Colder color, lower intensity
    interiorLight.position.set(0, buildingHeight - 1.5, 0);
    interiorLight.lookAt(0,0,0);
    building.add(interiorLight);


    // --- Canopy and Pumps ---
    const canopy = new THREE.Group();
    stationGroup.add(canopy);
    canopy.position.set(0, 0, 40);

    const canopyRoof = new THREE.Mesh(new THREE.BoxGeometry(30, 1.5, 50), roofMaterial);
    canopyRoof.position.y = buildingHeight + 4;
    canopy.add(canopyRoof);

    const canopyTrim = new THREE.Mesh(new THREE.BoxGeometry(32, 1, 52), redTrimMaterial);
    canopyTrim.position.y = buildingHeight + 3;
    canopy.add(canopyTrim);

    const pillarGeo = new THREE.CylinderGeometry(0.5, 0.5, buildingHeight + 3.25, 16);
    for(let i = -1; i <= 1; i += 2) {
        for(let j = -1; j <= 1; j += 2) {
            const pillar = new THREE.Mesh(pillarGeo, wallMaterial);
            pillar.position.set(i * 12, (buildingHeight + 3.25)/2, j * 22);
            canopy.add(pillar);
            colliders.push(pillar);
        }
    }

    function createGasPump(x, z) {
        const pump = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 4), roofMaterial);
        base.position.y = 0.25;
        pump.add(base);
        colliders.push(base);

        const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 4, 2), wallMaterial);
        body.position.y = 2.5;
        pump.add(body);

        pump.position.set(x, 0, z);
        canopy.add(pump);
    }

    createGasPump(-8, 0);
    createGasPump(8, 0);
    createGasPump(-8, -15);
    createGasPump(8, -15);

    // --- Garage Addition ---
    const garageWidth = 20, garageDepth = 25, garageHeight = 12;
    const garage = new THREE.Group();
    garage.position.set(-buildingWidth / 2 - garageWidth / 2, 0, 0);
    stationGroup.add(garage);

    const garageFloor = new THREE.Mesh(new THREE.BoxGeometry(garageWidth, wallThickness, garageDepth), floorMaterial);
    garageFloor.position.y = wallThickness / 2;
    garage.add(garageFloor);

    const garageCeiling = new THREE.Mesh(new THREE.BoxGeometry(garageWidth, wallThickness, garageDepth), roofMaterial);
    garageCeiling.position.y = garageHeight - wallThickness / 2;
    garage.add(garageCeiling);

    const garageBackWall = new THREE.Mesh(new THREE.BoxGeometry(garageWidth, garageHeight, wallThickness), wallMaterial);
    garageBackWall.position.set(0, garageHeight / 2, -garageDepth / 2);
    garage.add(garageBackWall);
    colliders.push(garageBackWall);

    const garageLeftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, garageHeight, garageDepth), wallMaterial);
    garageLeftWall.position.set(-garageWidth / 2, garageHeight / 2, 0);
    garage.add(garageLeftWall);
    colliders.push(garageLeftWall);

    // Garage Door (front wall)
    const garageDoorHeight = 10;
    const garageDoorRoll = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, garageWidth - 2, 16), roofMaterial);
    garageDoorRoll.rotation.z = Math.PI / 2;
    garageDoorRoll.position.set(0, garageHeight - 1, garageDepth / 2 - 1);
    garage.add(garageDoorRoll);

    const garageDoor = new THREE.Mesh(new THREE.BoxGeometry(garageWidth - 2, garageDoorHeight, 0.2), redTrimMaterial);
    garageDoor.position.set(0, garageDoorHeight / 2 - 2, garageDepth / 2 - 0.2); // Start partially open
    garage.add(garageDoor);

    // --- Exterior Details ---
    const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const tireGeo = new THREE.TorusGeometry(0.8, 0.3, 12, 24);
    
    const tire1 = new THREE.Mesh(tireGeo, tireMaterial);
    tire1.position.set(buildingWidth / 2 + 5, 1, 5);
    stationGroup.add(tire1);

    const tire2 = new THREE.Mesh(tireGeo, tireMaterial);
    tire2.position.set(buildingWidth / 2 + 5.5, 1, 5.5);
    tire2.rotation.y = Math.PI / 4;
    stationGroup.add(tire2);

    const tire3 = new THREE.Mesh(tireGeo, tireMaterial);
    tire3.position.set(buildingWidth / 2 + 4.5, 2.5, 5.2);
    stationGroup.add(tire3);

    const compressor = new THREE.Group();
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 3, 16), new THREE.MeshStandardMaterial({ color: 0x992222, roughness: 0.8, metalness: 0.5 }));
    tank.rotation.z = Math.PI / 2;
    compressor.add(tank);
    const motor = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    motor.position.y = 1;
    compressor.add(motor);
    compressor.position.set(-buildingWidth / 2 - garageWidth - 3, 1, 10);
    stationGroup.add(compressor);

    const iceBox = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 3), new THREE.MeshStandardMaterial({ color: 0xeeeeff, metalness: 0.2, roughness: 0.3 }));
    iceBox.position.set(buildingWidth / 2 + 3, 2.5, -5);
    stationGroup.add(iceBox);
}

export function createGasStationSign(scene, font) {
    const signGroup = new THREE.Group();
    signGroup.position.set(120, 0, -480);
    scene.add(signGroup);

    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9, metalness: 0.2 });
    const signBoxMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9, metalness: 0.4 });

    const poleHeight = 35;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, poleHeight, 10), poleMaterial);
    pole.position.y = poleHeight / 2;
    signGroup.add(pole);
    colliders.push(pole);

    const mainSignBox = new THREE.Mesh(new THREE.BoxGeometry(15, 8, 1.5), signBoxMaterial);
    mainSignBox.position.y = poleHeight - 5;
    mainSignBox.rotation.y = Math.PI / 12;
    signGroup.add(mainSignBox);

    const neonMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const textSettings = { font: font, size: 2, depth: 0.2 };

    const textGeo = new TextGeometry('BIG ED\'S', textSettings);
    textGeo.computeBoundingBox();
    const textWidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;
    const textMesh = new THREE.Mesh(textGeo, neonMaterial);
    textMesh.position.set(-textWidth / 2, poleHeight - 4, 1);
    textMesh.rotation.y = Math.PI / 12;
    signGroup.add(textMesh);
    
    const textGeo2 = new TextGeometry('GAS FARM', textSettings);
    textGeo2.computeBoundingBox();
    const textWidth2 = textGeo2.boundingBox.max.x - textGeo2.boundingBox.min.x;
    const textMesh2 = new THREE.Mesh(textGeo2, neonMaterial);
    textMesh2.position.set(-textWidth2 / 2, poleHeight - 7, 1);
    textMesh2.rotation.y = Math.PI / 12;
    signGroup.add(textMesh2);

    const signLight = new THREE.PointLight(0xffaa00, 40, 50, 2);
    signLight.position.set(0, poleHeight - 5, 5);
    signGroup.add(signLight);
    flickeringLights.push(signLight);
}

export function createRoadhouse(scene, font, game) {
    const roadhouse = new THREE.Group();
    roadhouse.position.set(-150, 0, -500);
    scene.add(roadhouse);

    roadhouse.traverse(function(child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    
    const roadhouseInterior = new THREE.Group();
    roadhouse.add(roadhouseInterior);
    setRoadhouseInterior(roadhouseInterior);

    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2c1a, roughness: 0.8 });
    const darkWoodMaterial = new THREE.MeshStandardMaterial({ color: 0x241a0f, roughness: 0.9 });
    const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.9 });
    const exteriorMaterial = darkWoodMaterial;
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x9a7142, roughness: 0.8 });

    const buildingWidth = 40, buildingDepth = 30, buildingHeight = 12, wallThickness = 0.5;

    const floor = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, wallThickness, buildingDepth), woodMaterial);
    floor.position.y = wallThickness / 2;
    floor.receiveShadow = true;
    roadhouse.add(floor);

    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, wallThickness, buildingDepth), darkWoodMaterial);
    ceiling.position.y = buildingHeight - (wallThickness / 2);
    ceiling.castShadow = true;
    roadhouse.add(ceiling);

    const overheadLight = new THREE.PointLight(0xfff0e1, 0.7, 60, 1.5);
    overheadLight.position.set(0, buildingHeight - 2, 0);
    roadhouse.add(overheadLight);
    roadhouseLights.push({light: overheadLight, initialIntensity: 0.7});


    function createWall(width, height, position, rotationY = 0) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, wallThickness), exteriorMaterial);
        wall.position.copy(position);
        wall.rotation.y = rotationY;
        roadhouse.add(wall);
        colliders.push(wall);
    }
    
    // Back and Left walls
    createWall(buildingWidth, buildingHeight, new THREE.Vector3(0, buildingHeight / 2, -buildingDepth / 2));
    createWall(buildingDepth, buildingHeight, new THREE.Vector3(-buildingWidth / 2, buildingHeight / 2, 0), Math.PI / 2);
    
    // Right wall is now solid again. The fireplace will sit in front of it.
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(buildingDepth, buildingHeight, wallThickness), exteriorMaterial);
    rightWall.position.set(buildingWidth / 2, buildingHeight / 2, 0);
    rightWall.rotation.y = Math.PI / 2;
    roadhouse.add(rightWall);
    colliders.push(rightWall);

    // Front wall built around the doors
    const doorWidth = 8, doorHeight = 7;
    const frontWallSideWidth = (buildingWidth / 2) - (doorWidth / 2);
    createWall(frontWallSideWidth, buildingHeight, new THREE.Vector3(-(doorWidth + frontWallSideWidth) / 2, buildingHeight / 2, buildingDepth / 2));
    createWall(frontWallSideWidth, buildingHeight, new THREE.Vector3((doorWidth + frontWallSideWidth) / 2, buildingHeight / 2, buildingDepth / 2));
    createWall(doorWidth, buildingHeight - doorHeight, new THREE.Vector3(0, doorHeight + (buildingHeight - doorHeight) / 2, buildingDepth / 2));
    
    const doorPositionLeft = new THREE.Vector3(-doorWidth / 2, doorHeight / 2, buildingDepth / 2);
    const doorPositionRight = new THREE.Vector3(doorWidth / 2, doorHeight / 2, buildingDepth / 2);

    const leftDoor = new Door(true, doorWidth, doorHeight, doorMaterial, doorPositionLeft);
    leftDoor.addToScene(roadhouse);
    doors.push(leftDoor);

    const rightDoor = new Door(false, doorWidth, doorHeight, doorMaterial, doorPositionRight);
    rightDoor.addToScene(roadhouse);
    doors.push(rightDoor);

    const barHeight = 4, barDepth = 3, barWidth = buildingWidth - 10;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(barWidth, barHeight, barDepth), darkWoodMaterial);
    bar.position.set(0, barHeight / 2, -buildingDepth / 2 + barDepth / 2 + 5);
    bar.castShadow = true;
    roadhouseInterior.add(bar);
    colliders.push(bar);

    function createJukebox() {
        const jukeGroup = new THREE.Group();
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x6e260e, roughness: 0.4, metalness: 0.1 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(5, 7, 3), bodyMaterial);
        body.position.y = 3.5;
        jukeGroup.add(body);
        colliders.push(body);
        const topArch = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 3, 16, 1, false, 0, Math.PI), bodyMaterial);
        topArch.rotation.x = -Math.PI / 2;
        topArch.rotation.y = Math.PI / 2;
        topArch.position.y = 7;
        jukeGroup.add(topArch);
        jukeGroup.position.set(-buildingWidth/2 + 4, 0, buildingDepth/2 - 4);
        jukeGroup.rotation.y = Math.PI / 4;
        roadhouseInterior.add(jukeGroup);

        const jukeBoxInteractable = {
            mesh: jukeGroup,
            prompt: `"...Let's rock."`, 
            onInteract: () => {
                if (game && game.triggerLodgeSequence) {
                    game.triggerLodgeSequence();
                }
            }
        };
        interactables.push(jukeBoxInteractable);
    }
    createJukebox();

    const porchDepth = 10;
    const porchFloor = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, 0.5, porchDepth), woodMaterial);
    porchFloor.position.set(0, 0.25, buildingDepth / 2 + porchDepth / 2);
    porchFloor.receiveShadow = true;
    roadhouse.add(porchFloor);

    const fireplaceAssembly = new THREE.Group();
    roadhouse.add(fireplaceAssembly);
    const brickTexture = createBrickTexture();
    const stoneMaterialWithBricks = new THREE.MeshStandardMaterial({ map: brickTexture });

    const chimneyWidth = 8, chimneyDepth = 4, openingHeight = 5, openingWidth = 5;
    // Position the fireplace inside the right wall
    const assemblyX = buildingWidth / 2 - chimneyDepth / 2 - wallThickness;
    fireplaceAssembly.position.set(assemblyX, 0, 0);
    fireplaceAssembly.rotation.y = -Math.PI / 2;
    
    const sideWidth = (chimneyWidth - openingWidth) / 2;

    const leftChimneyPart = new THREE.Mesh(new THREE.BoxGeometry(sideWidth, openingHeight, chimneyDepth), stoneMaterialWithBricks);
    leftChimneyPart.position.set(-(openingWidth / 2 + sideWidth / 2), openingHeight / 2, 0);
    fireplaceAssembly.add(leftChimneyPart);
    colliders.push(leftChimneyPart);

    const rightChimneyPart = new THREE.Mesh(new THREE.BoxGeometry(sideWidth, openingHeight, chimneyDepth), stoneMaterialWithBricks);
    rightChimneyPart.position.set(openingWidth / 2 + sideWidth / 2, openingHeight / 2, 0);
    fireplaceAssembly.add(rightChimneyPart);
    colliders.push(rightChimneyPart);
    
    const topChimneyPart = new THREE.Mesh(new THREE.BoxGeometry(chimneyWidth, buildingHeight + 5 - openingHeight, chimneyDepth), stoneMaterialWithBricks);
    topChimneyPart.position.set(0, openingHeight + (buildingHeight + 5 - openingHeight) / 2, 0);
    fireplaceAssembly.add(topChimneyPart);
    colliders.push(topChimneyPart);

    const backBrick = new THREE.Mesh(
        new THREE.PlaneGeometry(openingWidth, openingHeight), 
        new THREE.MeshStandardMaterial({ 
            map: brickTexture, 
            transparent: true
        })
    );
    backBrick.position.set(0, openingHeight/2, -chimneyDepth/2 + 0.01);
    fireplaceAssembly.add(backBrick);
    setFireplaceBacking(backBrick);
    // The back of the fireplace is the true door. It only becomes non-solid when the time is right.
    colliders.push(backBrick);

    return roadhouse;
}

export function createDoubleRDiner(scene, font, game) {
    const diner = new THREE.Group();
    diner.position.set(50, 0, -500);
    scene.add(diner);

    diner.traverse(function(child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000, roughness: 0.8 });
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.9 });
    const glassMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaeb5, transparent: true, opacity: 0.6, roughness: 0.4 });

    const buildingWidth = 30, buildingDepth = 40, buildingHeight = 10;

    const floor = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, 0.5, buildingDepth), floorMaterial);
    floor.position.y = 0.25;
    diner.add(floor);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, buildingHeight, 0.5), wallMaterial);
    backWall.position.set(0, buildingHeight / 2, -buildingDepth / 2);
    diner.add(backWall);
    colliders.push(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, buildingHeight, buildingDepth), wallMaterial);
    leftWall.position.set(-buildingWidth / 2, buildingHeight / 2, 0);
    diner.add(leftWall);
    colliders.push(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, buildingHeight, buildingDepth), wallMaterial);
    rightWall.position.set(buildingWidth / 2, buildingHeight / 2, 0);
    diner.add(rightWall);
    colliders.push(rightWall);
 
     // Front wall with door
    const doorWidth = 4, doorHeight = 7;
    const frontWallSideWidth = (buildingWidth - doorWidth) / 2;

    const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(frontWallSideWidth, buildingHeight, 0.5), wallMaterial);
    frontWallLeft.position.set(-buildingWidth / 2 + frontWallSideWidth / 2, buildingHeight / 2, buildingDepth / 2);
    diner.add(frontWallLeft);
    colliders.push(frontWallLeft);

    const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(frontWallSideWidth, buildingHeight, 0.5), wallMaterial);
    frontWallRight.position.set(buildingWidth / 2 - frontWallSideWidth / 2, buildingHeight / 2, buildingDepth / 2);
    diner.add(frontWallRight);
    colliders.push(frontWallRight);

    const frontWallTop = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, buildingHeight - doorHeight, 0.5), wallMaterial);
    frontWallTop.position.set(0, doorHeight + (buildingHeight - doorHeight) / 2, buildingDepth / 2);
    diner.add(frontWallTop);
    colliders.push(frontWallTop);

    const dinerDoor = new Door(false, doorWidth, doorHeight, new THREE.MeshStandardMaterial({color: 0x9a7142}), new THREE.Vector3(0, doorHeight / 2, buildingDepth / 2));
    dinerDoor.addToScene(diner);
    doors.push(dinerDoor);
 
     const roof = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, 0.5, buildingDepth), roofMaterial);
    roof.position.y = buildingHeight;
    diner.add(roof);

    const neonMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const textSettings = { font: font, size: 3, depth: 0.3 };
    const textGeo = new TextGeometry('RR', textSettings);
    textGeo.computeBoundingBox();
    const textWidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;
    const textMesh = new THREE.Mesh(textGeo, neonMaterial);
    textMesh.position.set(-textWidth / 2, buildingHeight - 2, buildingDepth / 2 + 0.5);
    diner.add(textMesh);

    const dinerLight = new THREE.PointLight(0xffffff, 20, 50, 2);
    dinerLight.position.set(0, buildingHeight, buildingDepth / 2 + 5);
    diner.add(dinerLight);
    flickeringLights.push(dinerLight);

    function createDinerJukebox() {
        const jukeGroup = new THREE.Group();
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x6e260e, roughness: 0.4, metalness: 0.1 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(5, 7, 3), bodyMaterial);
        body.position.y = 3.5;
        jukeGroup.add(body);
        colliders.push(body);
        const topArch = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 3, 16, 1, false, 0, Math.PI), bodyMaterial);
        topArch.rotation.x = -Math.PI / 2;
        topArch.rotation.y = Math.PI / 2;
        topArch.position.y = 7;
        jukeGroup.add(topArch);
        jukeGroup.position.set(-buildingWidth/2 + 5, 0, -buildingDepth/2 + 5);
        jukeGroup.rotation.y = Math.PI / 6;
        diner.add(jukeGroup);
        setJukebox(jukeGroup); // Save a reference to the jukebox

        const jukeBoxInteractable = {
            mesh: jukeGroup,
            prompt: `A vintage jukebox. It looks like it still works.`,
            onInteract: () => {
                if (hasOwlCaveCoin) {
                    jukeBoxInteractable.prompt = `You insert the strange coin. The song "A Place Both Wonderful and Strange" begins to play...`;
                    if (game && game.triggerRedRoomSequence) {
                        game.triggerRedRoomSequence();
                    }
                } else {
                    jukeBoxInteractable.prompt = `It only takes special coins.`;
                }
            }
        };
        interactables.push(jukeBoxInteractable);
    }
    createDinerJukebox();
 
     return diner;
 }

// --- THE BLACK LODGE ---

function createLodgeArmchair() {
    const chair = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: '#7B0001', roughness: 0.6 });
    
    const seat = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 3), material);
    seat.position.y = 1.5;
    chair.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 0.8), material);
    back.position.y = 3.5;
    back.position.z = -1.1;
    chair.add(back);

    const armGeo = new THREE.BoxGeometry(0.8, 1.5, 3);
    const leftArm = new THREE.Mesh(armGeo, material);
    leftArm.position.set(-1.9, 2.0, 0);
    chair.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo, material);
    rightArm.position.set(1.9, 2.0, 0);
    chair.add(rightArm);

    chair.castShadow = true;
    // Add the chair to the colliders so you can't walk through it.
    chair.traverse(child => {
        if (child.isMesh) colliders.push(child);
    });
    return chair;
}

function createLodgeStatue() {
    const statue = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: '#e0dacd', roughness: 0.3 });

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.5, 16), material);
    statue.add(pedestal);

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1, 4, 12), material);
    body.position.y = 2.5;
    statue.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), material);
    head.position.y = 5.0;
    statue.add(head);
    
    statue.castShadow = true;
    setLodgeStatue(statue);
    statue.traverse(child => {
        if (child.isMesh) colliders.push(child);
    });
    return statue;
}

function createManFromAnotherPlace() {
    const man = new THREE.Group();
    const redSuitMaterial = new THREE.MeshStandardMaterial({ color: '#A52A2A', roughness: 0.7 });
    const skinMaterial = new THREE.MeshStandardMaterial({ color: '#f2d3b3', roughness: 0.8 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 1), redSuitMaterial);
    body.position.y = 1.25;
    man.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), skinMaterial);
    head.position.y = 3.0;
    man.add(head);

    man.castShadow = true;
    man.traverse(child => {
        if (child.isMesh) colliders.push(child);
    });
    return man;
}

function createLauraDoppelganger(game) {
    const laura = new THREE.Group();
    const dressMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3, 1), dressMaterial);
    body.position.y = 1.5;
    laura.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), skinMaterial);
    head.position.y = 3.5;
    laura.add(head);

    laura.castShadow = true;
    setLauraDoppelganger(laura);
    laura.traverse(child => {
        if (child.isMesh) colliders.push(child);
    });

    const lauraInteractable = {
        mesh: laura,
        prompt: "", // The prompt is empty until you can leave.
        onInteract: () => {
            if (canExitLodge && game && game.triggerLodgeExit) {
                game.triggerLodgeExit();
            }
        }
    };
    interactables.push(lauraInteractable);

    return laura;
}

export function createDoppelganger(camera) {
    const ganger = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), material);
    head.position.y = 3.8;
    ganger.add(head);

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 3, 4, 8), material);
    body.position.y = 1.9;
    ganger.add(body);

    ganger.visible = false; 
    setDoppelganger(ganger);
    return ganger;
}


export function createBlackLodge(roadhouse, game) {
    const lodgeGroup = new THREE.Group();
    lodgeGroup.visible = false; 
    
    const buildingWidth = 40, buildingDepth = 30, buildingHeight = 12;

    const zigZagFloorMaterial = new THREE.MeshStandardMaterial({ map: createZigZagFloorTexture() });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, 0.5, buildingDepth), zigZagFloorMaterial);
    floor.position.y = 0.25;
    floor.receiveShadow = true;
    lodgeGroup.add(floor);

    const redCurtainTexture = createCurtainTexture();
    const curtainMaterial = new THREE.MeshStandardMaterial({
        map: redCurtainTexture,
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0.1
    });
    
    // The curtain walls are now physical barriers.
    const curtainWall = new THREE.Mesh(new THREE.PlaneGeometry(buildingWidth, buildingHeight), curtainMaterial);
    curtainWall.position.set(0, buildingHeight / 2, -buildingDepth / 2 + 0.5);
    curtainWall.receiveShadow = true;
    lodgeGroup.add(curtainWall);
    colliders.push(curtainWall);

    const curtainWall2 = curtainWall.clone();
    curtainWall2.rotation.y = Math.PI / 2;
    curtainWall2.position.set(-buildingWidth / 2 + 0.5, buildingHeight / 2, 0);
    lodgeGroup.add(curtainWall2);
    colliders.push(curtainWall2);
    
    const curtainWall3 = curtainWall.clone();
    curtainWall3.rotation.y = -Math.PI / 2;
    curtainWall3.position.set(buildingWidth / 2 - 0.5, buildingHeight / 2, 0);
    lodgeGroup.add(curtainWall3);
    colliders.push(curtainWall3);

    const curtainWall4 = curtainWall.clone();
    curtainWall4.rotation.y = Math.PI;
    curtainWall4.position.set(0, buildingHeight / 2, buildingDepth / 2 - 0.5);
    lodgeGroup.add(curtainWall4);
    colliders.push(curtainWall4);

    const armchair1 = createLodgeArmchair();
    armchair1.position.set(-10, 0, -5);
    lodgeGroup.add(armchair1);

    const armchair2 = createLodgeArmchair();
    armchair2.position.set(10, 0, -5);
    armchair2.rotation.y = Math.PI;
    lodgeGroup.add(armchair2);

    const statue = createLodgeStatue();
    statue.position.set(0, 0.25, -10);
    lodgeGroup.add(statue);

    const littleMan = createManFromAnotherPlace();
    littleMan.position.set(5, 0, 5);
    lodgeGroup.add(littleMan);
    setLodgeMan(littleMan);

    const laura = createLauraDoppelganger(game);
    laura.position.set(-5, 0, 5);
    lodgeGroup.add(laura);

    const strobe = new THREE.SpotLight(0xffffff, 0, 80, Math.PI * 0.3, 0.25, 1);
    strobe.position.set(0, buildingHeight, 0);
    strobe.target.position.set(0, 0, 0);
    strobe.castShadow = true;
    lodgeGroup.add(strobe);
    lodgeGroup.add(strobe.target);
    
    roadhouse.add(lodgeGroup);
    
    setBlackLodge(lodgeGroup);
    setLodgeStrobe(strobe);
}

export function createRedRoom(scene) {
    const redRoomGroup = new THREE.Group();
    redRoomGroup.visible = false; // It waits.
    
    const roomSize = 100; // The 'visible' size of the room
    const buildingHeight = 12;

    // Floor
    const zigZagFloorMaterial = new THREE.MeshStandardMaterial({ map: createZigZagFloorTexture() });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(roomSize, 0.5, roomSize), zigZagFloorMaterial);
    floor.position.y = 0.25;
    floor.receiveShadow = true;
    redRoomGroup.add(floor);

    // Curtains
    const redCurtainTexture = createCurtainTexture();
    const curtainMaterial = new THREE.MeshStandardMaterial({
        map: redCurtainTexture,
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0.1
    });
    
    const curtainWall = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, buildingHeight), curtainMaterial);
    curtainWall.position.set(0, buildingHeight / 2, -roomSize / 2 + 0.5);
    curtainWall.receiveShadow = true;
    redRoomGroup.add(curtainWall);
    colliders.push(curtainWall);

    const curtainWall2 = curtainWall.clone();
    curtainWall2.rotation.y = Math.PI / 2;
    curtainWall2.position.set(-roomSize / 2 + 0.5, buildingHeight / 2, 0);
    redRoomGroup.add(curtainWall2);
    colliders.push(curtainWall2);
    
    const curtainWall3 = curtainWall.clone();
    curtainWall3.rotation.y = -Math.PI / 2;
    curtainWall3.position.set(roomSize / 2 - 0.5, buildingHeight / 2, 0);
    redRoomGroup.add(curtainWall3);
    colliders.push(curtainWall3);

    const curtainWall4 = curtainWall.clone();
    curtainWall4.rotation.y = Math.PI;
    curtainWall4.position.set(0, buildingHeight / 2, roomSize / 2 - 0.5);
    redRoomGroup.add(curtainWall4);
    colliders.push(curtainWall4);

    // Statues
    const statue1 = createLodgeStatue();
    statue1.position.set(10, 0.25, -15);
    redRoomGroup.add(statue1);

    const statue2 = createLodgeStatue();
    statue2.position.set(-10, 0.25, -15);
    statue2.rotation.y = Math.PI / 8;
    redRoomGroup.add(statue2);

    // The Man From Another Place
    const littleMan = createManFromAnotherPlace();
    littleMan.position.set(0, 0, -10);
    littleMan.visible = false; // He only appears when it's time.
    redRoomGroup.add(littleMan);
    setRedRoomMan(littleMan);

    scene.add(redRoomGroup);
    setRedRoom(redRoomGroup);
    return redRoomGroup;
}
 
 export function createGhostwood(scene) {
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2d1a });
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x1a3a1a });

    function createDouglasFir(x, z) {
        const tree = new THREE.Group();
        const height = Math.random() * 40 + 20; // Tall, imposing trees
        const trunkHeight = height * 0.4;
        const trunkGeo = new THREE.CylinderGeometry(0.5, 1, trunkHeight, 8);
        const trunk = new THREE.Mesh(trunkGeo, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        tree.add(trunk);

        const leavesHeight = height * 0.6;
        const leavesGeo = new THREE.ConeGeometry(5, leavesHeight, 12);
        const leaves = new THREE.Mesh(leavesGeo, leavesMaterial);
        leaves.position.y = trunkHeight + leavesHeight / 2;
        leaves.castShadow = true;
        leaves.receiveShadow = true;
        tree.add(leaves);
        
        tree.position.set(x, 0, z);
        scene.add(tree);
    }

    for (let i = 0; i < 400; i++) { // More trees for a denser forest
        const x = (Math.random() - 0.5) * 1500;
        const z = (Math.random() - 0.5) * 1500;
        // Keep the central area clear
        if (Math.abs(x) > 100 || Math.abs(z) > 100) {
             if (z < -450 && z > -1000) { // Only in the distance behind the buildings
                createDouglasFir(x, z);
             }
        }
    }
}