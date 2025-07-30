// js/actors.js
// Here we give form to the formless. Every object in the world, from a humble cactus to the Man From Another Place, is born here.

import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { Door } from './Door.js';
import { createZigZagFloorTexture, createCurtainTexture, createBrickTexture } from './textures.js';
import { 
    colliders, doors, flickeringLights, setMoonLight, setMoon, setCat, 
    setCatHead, setVoidPortal, setVoidLight, addTentacle, cat, interactables, 
    saloonLights, setSaloonInterior, setBlackLodge, setLodgeStrobe, 
    setFireplaceBacking, setManFromAnotherPlace, setLodgeStatue, setDoppelganger
} from './state.js';
import { createGasStation, createCat as createOriginalCat, createVoidPortalAndTentacles, createTrashCans, createVegetation, createWaterTower, createTelephonePoles, createEnterableCar, createGasStationSign, createFace } from './actors-original.js';

export { createGasStation, createVoidPortalAndTentacles, createTrashCans, createVegetation, createWaterTower, createTelephonePoles, createEnterableCar, createGasStationSign, createFace };


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

export function createCat(scene) {
    return createOriginalCat(scene);
}

// --- BUILDING CREATION ---

export function createSaloon(scene, font, game) {
    const saloon = new THREE.Group();
    saloon.position.set(-150, 0, -500);
    scene.add(saloon);
    
    const saloonInterior = new THREE.Group();
    saloon.add(saloonInterior);
    setSaloonInterior(saloonInterior);

    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2c1a, roughness: 0.8 });
    const darkWoodMaterial = new THREE.MeshStandardMaterial({ color: 0x241a0f, roughness: 0.9 });
    const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.9 });
    const exteriorMaterial = darkWoodMaterial;
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x9a7142, roughness: 0.8 });

    const buildingWidth = 40, buildingDepth = 30, buildingHeight = 12, wallThickness = 0.5;

    const floor = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, wallThickness, buildingDepth), woodMaterial);
    floor.position.y = wallThickness / 2;
    floor.receiveShadow = true;
    saloon.add(floor);

    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, wallThickness, buildingDepth), darkWoodMaterial);
    ceiling.position.y = buildingHeight - (wallThickness / 2);
    ceiling.castShadow = true;
    saloon.add(ceiling);

    const overheadLight = new THREE.PointLight(0xfff0e1, 0.7, 60, 1.5);
    overheadLight.position.set(0, buildingHeight - 2, 0);
    saloon.add(overheadLight);
    saloonLights.push({light: overheadLight, initialIntensity: 0.7});


    function createWall(width, height, position, rotationY = 0) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, wallThickness), exteriorMaterial);
        wall.position.copy(position);
        wall.rotation.y = rotationY;
        saloon.add(wall);
        colliders.push(wall);
    }
    
    // Back and Left walls
    createWall(buildingWidth, buildingHeight, new THREE.Vector3(0, buildingHeight / 2, -buildingDepth / 2));
    createWall(buildingDepth, buildingHeight, new THREE.Vector3(-buildingWidth / 2, buildingHeight / 2, 0), Math.PI / 2);
    
    // Right wall is now solid again. The fireplace will sit in front of it.
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(buildingDepth, buildingHeight, wallThickness), exteriorMaterial);
    rightWall.position.set(buildingWidth / 2, buildingHeight / 2, 0);
    rightWall.rotation.y = Math.PI / 2;
    saloon.add(rightWall);
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
    leftDoor.addToScene(saloon);
    doors.push(leftDoor);

    const rightDoor = new Door(false, doorWidth, doorHeight, doorMaterial, doorPositionRight);
    rightDoor.addToScene(saloon);
    doors.push(rightDoor);

    const barHeight = 4, barDepth = 3, barWidth = buildingWidth - 10;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(barWidth, barHeight, barDepth), darkWoodMaterial);
    bar.position.set(0, barHeight / 2, -buildingDepth / 2 + barDepth / 2 + 5);
    bar.castShadow = true;
    saloonInterior.add(bar);
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
        saloonInterior.add(jukeGroup);

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
    saloon.add(porchFloor);

    const fireplaceAssembly = new THREE.Group();
    saloon.add(fireplaceAssembly);
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

    return saloon;
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
    setManFromAnotherPlace(man);
    man.traverse(child => {
        if (child.isMesh) colliders.push(child);
    });
    return man;
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


export function createBlackLodge(saloon) {
    const lodgeGroup = new THREE.Group();
    lodgeGroup.visible = false; 
    
    const buildingWidth = 40, buildingDepth = 30, buildingHeight = 12;

    const zigZagFloorMaterial = new THREE.MeshStandardMaterial({ map: createZigZagFloorTexture() });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, 0.5, buildingDepth), zigZagFloorMaterial);
    floor.position.y = 0.25;
    floor.receiveShadow = true;
    lodgeGroup.add(floor);

    const redCurtainTexture = createCurtainTexture(true); 
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

    const strobe = new THREE.SpotLight(0xffffff, 0, 80, Math.PI * 0.3, 0.25, 1);
    strobe.position.set(0, buildingHeight, 0);
    strobe.target.position.set(0, 0, 0);
    strobe.castShadow = true;
    lodgeGroup.add(strobe);
    lodgeGroup.add(strobe.target);
    
    saloon.add(lodgeGroup);
    
    setBlackLodge(lodgeGroup);
    setLodgeStrobe(strobe);
}
