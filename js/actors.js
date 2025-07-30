// js/actors.js

import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { Door } from './Door.js';
import { createBrickTexture, createCharredLogTexture, createEmberTexture, createNewspaperTexture, createPlayingCardTexture, createZigZagFloorTexture, createCurtainTexture } from './textures.js';
import { colliders, doors, flickeringLights, setMoonLight, setMoon, setCat, setCatHead, setVoidPortal, setVoidLight, addTentacle, cat, setFireMaterial, setEmberMaterial, interactables, saloonLights, setSaloonInterior, setBlackLodge, setLodgeStrobe, setFireplaceBacking } from './state.js';

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

export function createGasStation(scene) {
    const stationGroup = new THREE.Group();
    stationGroup.position.set(150, 0, -500);
    scene.add(stationGroup);

    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.8 });
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const redTrimMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xaa0000, emissiveIntensity: 0.8 });
    const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x8899aa, transparent: true, opacity: 0.3, roughness: 0.1 });

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

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, buildingHeight, buildingDepth), wallMaterial);
    leftWall.position.set(-buildingWidth / 2, buildingHeight / 2, 0);
    building.add(leftWall);
    colliders.push(leftWall);

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

    // Interior
    const counter = new THREE.Mesh(new THREE.BoxGeometry(15, 3.5, 3), new THREE.MeshStandardMaterial({color: 0x666666}));
    counter.position.set(0, 3.5/2, -buildingDepth/2 + 3);
    building.add(counter);
    colliders.push(counter);

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
}

export function createSaloon(scene, font, game) {
    const saloon = new THREE.Group();
    saloon.position.set(-150, 0, -500);
    scene.add(saloon);
    
    // This group will hold all the objects that disappear during the lodge transition
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
    
    createWall(buildingWidth, buildingHeight, new THREE.Vector3(0, buildingHeight / 2, -buildingDepth / 2));
    createWall(buildingDepth, buildingHeight, new THREE.Vector3(-buildingWidth / 2, buildingHeight / 2, 0), Math.PI / 2);
    
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, buildingHeight, buildingDepth), stoneMaterial);
    rightWall.position.x = buildingWidth / 2;
    rightWall.position.y = buildingHeight / 2;
    saloon.add(rightWall);
    colliders.push(rightWall);
    
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

    function createBottle() {
        const bottleArchetypes = [
            { points: [ new THREE.Vector2(0, 0), new THREE.Vector2(0.25, 0), new THREE.Vector2(0.28, 0.4), new THREE.Vector2(0.1, 0.9), new THREE.Vector2(0.12, 1.2), new THREE.Vector2(0.05, 1.3), new THREE.Vector2(0, 1.3) ], scale: 1.05 },
            { points: [ new THREE.Vector2(0, 0), new THREE.Vector2(0.3, 0), new THREE.Vector2(0.3, 0.6), new THREE.Vector2(0.28, 0.8), new THREE.Vector2(0.1, 1.0), new THREE.Vector2(0, 1.0) ], scale: 1.0 },
            { points: [ new THREE.Vector2(0, 0), new THREE.Vector2(0.15, 0), new THREE.Vector2(0.15, 1.0), new THREE.Vector2(0.08, 1.3), new THREE.Vector2(0.1, 1.4), new THREE.Vector2(0, 1.4) ], scale: 1.1 },
            { points: [ new THREE.Vector2(0, 0), new THREE.Vector2(0.1, 0), new THREE.Vector2(0.35, 0.2), new THREE.Vector2(0.3, 0.5), new THREE.Vector2(0.1, 0.8), new THREE.Vector2(0, 0.8) ], scale: 0.95 }
        ];

        const archetype = bottleArchetypes[Math.floor(Math.random() * bottleArchetypes.length)];
        const geometry = new THREE.LatheGeometry(archetype.points, 12);
        
        const bottleMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(Math.random() * 0.5 + 0.2, Math.random() * 0.3 + 0.1, Math.random() * 0.1),
            transparent: true, opacity: 0.8, roughness: 0.1, metalness: 0.2
        });

        const bottle = new THREE.Mesh(geometry, bottleMaterial);
        bottle.scale.set(1, archetype.scale, 1);
        bottle.castShadow = true;
        
        const topperMaterial = new THREE.MeshStandardMaterial({
            color: 0x3d2c1a, roughness: 0.9, metalness: 0.1
        });

        const topPoint = archetype.points[archetype.points.length - 2];
        const topRadius = topPoint.x;
        const bottleTopY = topPoint.y * archetype.scale;
        const topperHeight = 0.1;

        const topperGeometry = new THREE.CylinderGeometry(topRadius, topRadius, topperHeight, 8);
        const topper = new THREE.Mesh(topperGeometry, topperMaterial);
        topper.castShadow = true;
        topper.position.y = bottleTopY + (topperHeight / 2);

        const bottleGroup = new THREE.Group();
        bottleGroup.add(bottle);
        bottleGroup.add(topper);
        bottleGroup.userData.geometry = geometry; 
        return bottleGroup;
    }

    const shelfPositionsY = [5, 8.5];
    shelfPositionsY.forEach(y => {
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth - 4, 0.3, 1.5), darkWoodMaterial);
        shelf.position.set(0, y, -buildingDepth / 2 + 1.5/2);
        saloonInterior.add(shelf);
        
        let currentX = -(buildingWidth - 4) / 2 + 0.5;
        while (currentX < (buildingWidth - 4) / 2 - 0.5) {
            const bottleGroup = createBottle();
            bottleGroup.userData.geometry.computeBoundingBox();
            const bottleWidth = bottleGroup.userData.geometry.boundingBox.max.x - bottleGroup.userData.geometry.boundingBox.min.x;
            bottleGroup.position.set(currentX + bottleWidth / 2, y + 0.3 / 2, shelf.position.z + (Math.random() - 0.5) * 1.5 * 0.5);
            saloonInterior.add(bottleGroup);
            currentX += bottleWidth + (Math.random() * 0.05 + 0.02);
        }

        const shelfLight = new THREE.RectAreaLight(0xffd580, 2, buildingWidth - 5, 0.2);
        shelfLight.position.set(0, y - 0.2, shelf.position.z);
        shelfLight.lookAt(0, y - 1, shelf.position.z);
        saloon.add(shelfLight);
        saloonLights.push({light: shelfLight, initialIntensity: 2});
    });

    const fireplaceAssembly = new THREE.Group();
    saloon.add(fireplaceAssembly);

    const chimneyWidth = 8, chimneyDepth = 4, openingHeight = 5, openingWidth = 5;
    const assemblyX = buildingWidth / 2 - chimneyDepth / 2;
    fireplaceAssembly.position.set(assemblyX, 0, 0);
    fireplaceAssembly.rotation.y = -Math.PI / 2;
    
    const brickTexture = createBrickTexture();
    const stoneMaterialWithBricks = new THREE.MeshStandardMaterial({ map: brickTexture });
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
    colliders.push(backBrick);

    const hearth = new THREE.Mesh(new THREE.BoxGeometry(chimneyWidth + 2, 0.5, chimneyDepth + 2), stoneMaterialWithBricks);
    hearth.position.y = 0.25;
    fireplaceAssembly.add(hearth);
    colliders.push(hearth);

    const mantle = new THREE.Mesh(new THREE.BoxGeometry(chimneyWidth + 1, 0.8, chimneyDepth - 1), darkWoodMaterial);
    mantle.position.y = openingHeight + 0.4;
    mantle.castShadow = true;
    fireplaceAssembly.add(mantle);

    const fireHolder = new THREE.Group();
    fireHolder.position.set(0, 0.8, 1);
    fireplaceAssembly.add(fireHolder);
    saloonInterior.add(fireHolder);

    const fireLight = new THREE.PointLight(0xff7700, 2.5, 40, 2);
    fireLight.position.set(0, openingHeight / 2, chimneyDepth / 2 + 1.5);
    fireplaceAssembly.add(fireLight);
    flickeringLights.push(fireLight);
    saloonLights.push({light: fireLight, initialIntensity: 2.5});


    const porchDepth = 10;
    const porchFloor = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, 0.5, porchDepth), woodMaterial);
    porchFloor.position.set(0, 0.25, buildingDepth / 2 + porchDepth / 2);
    porchFloor.receiveShadow = true;
    saloon.add(porchFloor);

    function createPorchLight(x, isFlickering) {
        const porchLight = new THREE.SpotLight(0xffd580, 20, 30, Math.PI * 0.4, 0.5, 2);
        porchLight.position.set(x, buildingHeight, buildingDepth / 2 + 3);
        porchLight.castShadow = true;
        const target = new THREE.Object3D();
        target.position.set(x, 0, buildingDepth / 2);
        saloon.add(target);
        porchLight.target = target;
        saloon.add(porchLight);
        if (isFlickering) flickeringLights.push(porchLight);
    }
    createPorchLight(0, false);
    createPorchLight(-buildingWidth / 2 + 6, true);
    createPorchLight(buildingWidth / 2 - 6, false);

    const sign = new THREE.Mesh(new THREE.BoxGeometry(12, 5, 0.5), woodMaterial);
    sign.position.set(0, buildingHeight + 5, buildingDepth/2);
    saloon.add(sign);
    
    const textMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700, emissive: 0xFFD700, emissiveIntensity: 1 });
    const text = "Tachonker's Tavern";
    const textGeometry = new TextGeometry(text, { font: font, size: 1.5, height: 0.2, });
    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-textWidth / 2, buildingHeight + 4, buildingDepth / 2 + 0.3);
    saloon.add(textMesh);


    function createSaloonTable(x, z) {
        const tableGroup = new THREE.Group();
        const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.2, 16), woodMaterial);
        tableTop.position.y = 3;
        tableTop.castShadow = true;
        tableGroup.add(tableTop);
        colliders.push(tableTop);
        const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 3, 8), darkWoodMaterial);
        tableLeg.position.y = 1.5;
        tableLeg.castShadow = true;
        tableGroup.add(tableLeg);
        colliders.push(tableLeg);
        tableGroup.position.set(x, 0, z);
        saloonInterior.add(tableGroup);
        return tableGroup;
    }

    function createSaloonChair(table, angle, isOverturned = false) {
        const chairGroup = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.2, 12), woodMaterial);
        seat.position.y = 1.5;
        chairGroup.add(seat);
        const backHeight = 2;
        const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, backHeight, 0.2), woodMaterial);
        back.position.y = 1.5 + backHeight / 2;
        back.position.z = -0.8;
        chairGroup.add(back);
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 6), darkWoodMaterial);
        leg.position.y = 0.75;
        chairGroup.add(leg);
        chairGroup.position.set(table.position.x + Math.cos(angle) * 3.5, 0, table.position.z + Math.sin(angle) * 3.5);
        chairGroup.rotation.y = -angle + Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        if (isOverturned) { chairGroup.rotation.z = Math.PI / 2; chairGroup.position.y = 1; }
        chairGroup.castShadow = true;
        saloonInterior.add(chairGroup);
        colliders.push(chairGroup);
    }
    const table1 = createSaloonTable(-10, 5);
    createSaloonChair(table1, Math.PI / 4);
    createSaloonChair(table1, Math.PI * 3 / 4, true);
    createSaloonChair(table1, Math.PI * 5 / 4);

    const table2 = createSaloonTable(10, -5);
    createSaloonChair(table2, Math.PI / 2);
    createSaloonChair(table2, Math.PI);
    createSaloonChair(table2, Math.PI * 3 / 2);

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
            prompt: 'Press E to play a song',
            onInteract: () => {
                if (game && game.triggerLodgeSequence) {
                    game.triggerLodgeSequence();
                }
            }
        };
        interactables.push(jukeBoxInteractable);
    }
    createJukebox();

    const light1 = new THREE.PointLight(0xffa500, 1.5, 20, 2);
    light1.position.set(-15, 5, 0);
    saloon.add(light1);
    flickeringLights.push(light1);
    saloonLights.push({light: light1, initialIntensity: 1.5});

    const light2 = new THREE.PointLight(0xffa500, 1.5, 20, 2);
    light2.position.set(15, 5, 0);
    saloon.add(light2);
    flickeringLights.push(light2);
    saloonLights.push({light: light2, initialIntensity: 1.5});

    return saloon;
}


export function createBlackLodge(saloon) {
    const lodgeGroup = new THREE.Group();
    lodgeGroup.visible = false; 
    
    const buildingWidth = 40, buildingDepth = 30, buildingHeight = 12;

    const zigZagFloorMaterial = new THREE.MeshStandardMaterial({ map: createZigZagFloorTexture() });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, 0.5, buildingDepth), zigZagFloorMaterial);
    floor.position.y = 0.25;
    lodgeGroup.add(floor);

    const redCurtainTexture = createCurtainTexture(true); 
    const curtainMaterial = new THREE.MeshBasicMaterial({ map: redCurtainTexture, side: THREE.DoubleSide });
    
    const curtainWall = new THREE.Mesh(new THREE.PlaneGeometry(buildingWidth, buildingHeight), curtainMaterial);
    curtainWall.position.set(0, buildingHeight / 2, -buildingDepth / 2 + 0.5);
    lodgeGroup.add(curtainWall);

    const curtainWall2 = curtainWall.clone();
    curtainWall2.rotation.y = Math.PI / 2;
    curtainWall2.position.set(-buildingWidth / 2 + 0.5, buildingHeight / 2, 0);
    lodgeGroup.add(curtainWall2);
    
    const curtainWall3 = curtainWall.clone();
    curtainWall3.rotation.y = -Math.PI / 2;
    curtainWall3.position.set(buildingWidth / 2 - 0.5, buildingHeight / 2, 0);
    lodgeGroup.add(curtainWall3);

    const curtainWall4 = curtainWall.clone();
    curtainWall4.rotation.y = Math.PI;
    curtainWall4.position.set(0, buildingHeight / 2, buildingDepth / 2 - 0.5);
    lodgeGroup.add(curtainWall4);

    const strobe = new THREE.SpotLight(0xffffff, 0, 80, Math.PI * 0.3, 0.25, 1);
    strobe.position.set(0, buildingHeight, 0);
    strobe.target.position.set(0, 0, 0);
    lodgeGroup.add(strobe);
    lodgeGroup.add(strobe.target);
    
    saloon.add(lodgeGroup);
    
    setBlackLodge(lodgeGroup);
    setLodgeStrobe(strobe);
}

export function createCat(scene) {
    const newCat = new THREE.Group();
    scene.add(newCat);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    const accentMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.8 });
    const innerEarMaterial = new THREE.MeshStandardMaterial({ color: 0xdb7093, roughness: 0.9 });
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffc940 });
    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(1.4, 20, 16), bodyMaterial);
    bodyMesh.scale.set(1, 1.2, 0.9);
    bodyMesh.position.y = (1.4 * 1.2) / 2;
    bodyMesh.castShadow = true;
    newCat.add(bodyMesh);
    const newCatHead = new THREE.Group();
    newCat.add(newCatHead);
    newCatHead.position.y = (1.4 * 1.2) + 0.5;
    newCatHead.position.z = 0.2;
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.8, 20, 16), bodyMaterial);
    headMesh.castShadow = true;
    newCatHead.add(headMesh);
    const eyeRadius = 0.15;
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(eyeRadius, 12, 8), eyeMaterial);
    leftEye.position.set(0.3, 0.15, 0.7);
    leftEye.name = "leftEye";
    newCatHead.add(leftEye);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(eyeRadius, 12, 8), eyeMaterial);
    rightEye.position.set(-0.3, 0.15, 0.7);
    rightEye.name = "rightEye";
    newCatHead.add(rightEye);
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius * 0.6, 12), pupilMaterial);
    pupil.position.z = 0.7 + eyeRadius + 0.01;
    const leftPupil = pupil.clone();
    leftPupil.position.x = 0.3;
    leftPupil.position.y = 0.15;
    const rightPupil = pupil.clone();
    rightPupil.position.x = -0.3;
    rightPupil.position.y = 0.15;
    newCatHead.add(leftPupil, rightPupil);
    const earScale = 2.8;
    const earOuter = new THREE.Mesh(new THREE.ConeGeometry(0.25 * earScale, 0.5 * earScale, 8), bodyMaterial);
    const earInner = new THREE.Mesh(new THREE.ConeGeometry(0.18 * earScale, 0.4 * earScale, 8), innerEarMaterial);
    earInner.position.z = 0.05;
    const leftEar = new THREE.Group().add(earOuter.clone(), earInner.clone());
    leftEar.position.set(0.4, 0.5, 0);
    leftEar.rotation.set(0, 0, -Math.PI / 10);
    const rightEar = new THREE.Group().add(earOuter.clone(), earInner.clone());
    rightEar.position.set(-0.4, 0.5, 0);
    rightEar.rotation.z = Math.PI / 10;
    newCatHead.add(leftEar, rightEar);
    const leg = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8), bodyMaterial);
    leg.scale.set(0.8 * 0.7, 1.8 * 0.7, 0.8 * 0.7);
    leg.position.y = 0.6;
    leg.position.z = 1;
    leg.castShadow = true;
    const leftLeg = leg.clone();
    leftLeg.position.x = 0.45;
    const rightLeg = leg.clone();
    rightLeg.position.x = -0.45;
    newCat.add(leftLeg, rightLeg);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 8), accentMaterial);
    paw.scale.set(1.1 * 0.7, 0.7 * 0.7, 1 * 0.7);
    paw.position.y = 0.2;
    paw.position.z = 1.2;
    paw.castShadow = true;
    const leftPaw = paw.clone();
    leftPaw.position.x = 0.45;
    const rightPaw = paw.clone();
    rightPaw.position.x = -0.45;
    newCat.add(leftPaw, rightPaw);
    const tailCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.8, -0.6), new THREE.Vector3(-0.8, 0.4, -1.0),
        new THREE.Vector3(-1.5, 0.15, -0.4), new THREE.Vector3(-1.8, 0.1, 0.3),
    ]);
    const tailGeometry = new THREE.TubeGeometry(tailCurve, 32, 0.2, 8, false);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.castShadow = true;
    newCat.add(tail);
    
    newCat.position.set(130, 0, -478);
    newCat.rotation.y = -Math.PI / 4;

    setCat(newCat);
    setCatHead(newCatHead);
}

export function createVoidPortalAndTentacles(scene) {
    const portalGeometry = new THREE.CircleGeometry(5, 64);
    const portalMaterial = new THREE.ShaderMaterial({
        uniforms: { u_time: { value: 0.0 }, },
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
            uniform float u_time; varying vec2 vUv;
            float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123); }
            float noise(vec2 st) {
                vec2 i = floor(st); vec2 f = fract(st);
                float a = random(i); float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0)); float d = random(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.y * u.x;
            }
            void main() {
                vec2 p = vUv - 0.5; float r = length(p); float angle = atan(p.y, p.x);
                float swirl = noise(vec2(r * 4.0 - u_time * 0.3, angle * 2.0));
                vec3 color = vec3(swirl * 0.2, 0.0, swirl * 0.4);
                float edge = 1.0 - smoothstep(0.4, 0.5, r);
                gl_FragColor = vec4(color, edge);
            }`,
        transparent: true, side: THREE.DoubleSide
    });
    const newVoidPortal = new THREE.Mesh(portalGeometry, portalMaterial);
    newVoidPortal.position.set(cat.position.x, 0.1, cat.position.z); // Match cat's new position
    newVoidPortal.rotation.x = -Math.PI / 2;
    newVoidPortal.scale.set(0, 0, 0);
    scene.add(newVoidPortal);
    setVoidPortal(newVoidPortal);

    const newVoidLight = new THREE.PointLight(0x440044, 0, 30, 2);
    newVoidLight.position.set(cat.position.x, 2, cat.position.z); // Match cat's new position
    scene.add(newVoidLight);
    setVoidLight(newVoidLight);

    const tentacleMaterial = new THREE.MeshStandardMaterial({ color: 0x100010, roughness: 0.8 });
    for (let i = 0; i < 5; i++) {
        const points = [];
        for (let j = 0; j < 10; j++) {
            points.push(new THREE.Vector3(0, j * 1.5, 0));
        }
        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, 20, 0.3, 8, false);
        const tentacle = new THREE.Mesh(geometry, tentacleMaterial);
        const angle = (i / 5) * Math.PI * 2;
        const radius = Math.random() * 2 + 1.5;
        tentacle.position.set(newVoidPortal.position.x + Math.cos(angle) * radius, -10, newVoidPortal.position.z + Math.sin(angle) * radius);
        tentacle.userData.angle = angle;
        tentacle.userData.radius = radius;
        tentacle.visible = false;
        scene.add(tentacle);
        addTentacle(tentacle);
    }
}

export function createTrashCans(scene) {
    const canMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.7, roughness: 0.5 });
    const createCan = (x, z, rotation) => {
        const canGroup = new THREE.Group(); scene.add(canGroup);
        canGroup.position.set(x, 0, z); canGroup.rotation.y = rotation;
        const body = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 4, 12), canMaterial);
        body.position.y = 2; body.castShadow = true; canGroup.add(body); colliders.push(body);
        const lid = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.3, 12), canMaterial);
        lid.position.y = 4.15; lid.castShadow = true; lid.rotation.x = Math.PI / 16; canGroup.add(lid);
    };
    createCan(182, -510, Math.PI / 8); 
    createCan(182, -515, -Math.PI / 12);
}

export function createVegetation(scene) {
    const cactusMaterial = new THREE.MeshStandardMaterial({ color: 0x2e602e });
    const shrubMaterial = new THREE.MeshStandardMaterial({ color: 0x1a3a1a });
    function createCactus(x, z) {
        const cactus = new THREE.Group();
        const mainHeight = Math.random() * 2.5 + 1;
        const mainBody = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, mainHeight, 8), cactusMaterial);
        mainBody.position.y = mainHeight / 2;
        mainBody.castShadow = true;
        cactus.add(mainBody);
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1, 8), cactusMaterial);
        arm.position.set(0.3, mainHeight * 0.7, 0);
        arm.rotation.z = -Math.PI / 2;
        arm.castShadow = true;
        cactus.add(arm);
        cactus.position.set(x, 0, z);
        scene.add(cactus);
    }
    function createShrub(x, z) {
        const shrub = new THREE.Mesh(new THREE.SphereGeometry(Math.random() * 0.8 + 0.4, 8, 6), shrubMaterial);
        shrub.position.set(x, 0.5, z);
        shrub.castShadow = true;
        scene.add(shrub);
    }
    for (let i = 0; i < 200; i++) {
        const x = (Math.random() - 0.5) * 800;
        const z = (Math.random() - 0.5) * 800;
        if (Math.abs(x) > 50 || (z > -450 || z < -550)) {
            if (Math.random() > 0.5) createCactus(x, z);
            else createShrub(x, z);
        }
    }
}

export function createWaterTower(scene) {
    const tower = new THREE.Group();
    const rustyMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9, metalness: 0.4 });
    
    const tankHeight = 15;
    const tankRadius = 10;
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(tankRadius, tankRadius, tankHeight, 32), rustyMaterial);
    tank.position.y = 60;
    tank.castShadow = true;
    tower.add(tank);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(tankRadius, 5, 32), rustyMaterial);
    roof.position.y = 60 + tankHeight / 2 + 2.5;
    roof.castShadow = true;
    tower.add(roof);

    const legHeight = 52.5;
    const legRadius = 0.8;
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(legRadius, legRadius, legHeight, 8), rustyMaterial);
        leg.position.set(Math.cos(angle) * tankRadius * 0.8, legHeight / 2, Math.sin(angle) * tankRadius * 0.8);
        leg.rotation.z = (i % 2 === 0) ? 0.2 : -0.2;
        leg.rotation.x = (i < 2) ? 0.2 : -0.2;
        leg.castShadow = true;
        tower.add(leg);
        colliders.push(leg);
    }
    
    tower.position.set(250, 0, -600);
    scene.add(tower);
}

export function createTelephonePoles(scene) {
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2d27, roughness: 0.9 });
    const poleHeight = 18;
    const poleRadius = 0.4;

    function createPole(x, z) {
        const poleGroup = new THREE.Group();
        const mainPole = new THREE.Mesh(new THREE.CylinderGeometry(poleRadius, poleRadius, poleHeight, 8), poleMaterial);
        mainPole.position.y = poleHeight / 2;
        mainPole.castShadow = true;
        poleGroup.add(mainPole);
        colliders.push(mainPole);

        const crossArm = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 0.5), poleMaterial);
        crossArm.position.y = poleHeight - 3;
        crossArm.castShadow = true;
        poleGroup.add(crossArm);
        
        poleGroup.position.set(x, 0, z);
        scene.add(poleGroup);
    }

    for (let i = -15; i < 15; i++) {
        createPole(i * 50, -485);
    }
}

export function createEnterableCar(scene) {
    const car = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.5, metalness: 0.5 });
    const interiorMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(9, 3, 5), bodyMaterial);
    mainBody.position.y = 2;
    car.add(mainBody);
    colliders.push(mainBody);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(5, 2.5, 4.8), bodyMaterial);
    cabin.position.y = 3 + 1.25;
    cabin.position.x = -1;
    car.add(cabin);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 1.8), interiorMaterial);
    seat.position.set(-2, 1.5, 1);
    car.add(seat);

    const dashboard = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 4.6), interiorMaterial);
    dashboard.position.set(0.2, 2, 0);
    car.add(dashboard);

    const wheelGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const wheelPositions = [
        new THREE.Vector3(-3, 0.8, 2.5), new THREE.Vector3(3, 0.8, 2.5),
        new THREE.Vector3(-3, 0.8, -2.5), new THREE.Vector3(3, 0.8, -2.5)
    ];
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMaterial);
        wheel.position.copy(pos);
        car.add(wheel);
    });

    car.position.set(180, 0, -485);
    car.rotation.y = -0.8;
    scene.add(car);

    const carDoor = new Door(true, 2.5, 3.5, bodyMaterial, new THREE.Vector3(-0.5, 2.2, 2.5), true);
    carDoor.addToScene(car);
    doors.push(carDoor);
}

export function createGasStationSign(scene, font) {
    const signGroup = new THREE.Group();
    signGroup.position.set(120, 0, -480);
    scene.add(signGroup);

    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 });
    const signBoxMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

    const poleHeight = 40;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, poleHeight, 12), poleMaterial);
    pole.position.y = poleHeight / 2;
    signGroup.add(pole);
    colliders.push(pole);

    const mainSignBox = new THREE.Mesh(new THREE.BoxGeometry(12, 5, 1), signBoxMaterial);
    mainSignBox.position.y = 30;
    signGroup.add(mainSignBox);

    const verticalSignBox = new THREE.Mesh(new THREE.BoxGeometry(5, 12, 1), signBoxMaterial);
    verticalSignBox.position.y = 21;
    signGroup.add(verticalSignBox);

    const topCircle = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 0.8, 32), signBoxMaterial);
    topCircle.position.y = 36;
    topCircle.rotation.x = Math.PI / 2;
    signGroup.add(topCircle);

    const redNeonMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const blueNeonMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff });
    
    const textSettings = { font: font, size: 3, height: 0.3 };
    
    const gasGeo = new TextGeometry('GAS', textSettings);
    gasGeo.computeBoundingBox();
    const gasWidth = gasGeo.boundingBox.max.x - gasGeo.boundingBox.min.x;
    const gasMesh = new THREE.Mesh(gasGeo, redNeonMaterial);
    gasMesh.position.set(-gasWidth / 2, 28.5, 0.55);
    signGroup.add(gasMesh);

    const gasLight = new THREE.PointLight(0xff0000, 50, 30, 2);
    gasLight.position.set(0, 30, 2);
    signGroup.add(gasLight);
    flickeringLights.push(gasLight);

    const verticalTextSettings = { font: font, size: 2, height: 0.3 };
    const lastGeo = new TextGeometry('LAST', verticalTextSettings);
    lastGeo.computeBoundingBox();
    const lastWidth = lastGeo.boundingBox.max.x - lastGeo.boundingBox.min.x;
    const lastMesh = new THREE.Mesh(lastGeo, redNeonMaterial);
    lastMesh.position.set(-lastWidth / 2, 23, 0.55);
    signGroup.add(lastMesh);
    
    const stopGeo = new TextGeometry('STOP', verticalTextSettings);
    stopGeo.computeBoundingBox();
    const stopWidth = stopGeo.boundingBox.max.x - stopGeo.boundingBox.min.x;
    const stopMesh = new THREE.Mesh(stopGeo, redNeonMaterial);
    stopMesh.position.set(-stopWidth / 2, 18, 0.55);
    signGroup.add(stopMesh);

    const topGeo = new TextGeometry('LS', { font: font, size: 2.5, height: 0.3 });
    topGeo.computeBoundingBox();
    const topWidth = topGeo.boundingBox.max.x - topGeo.boundingBox.min.x;
    const topMesh = new THREE.Mesh(topGeo, blueNeonMaterial);
    topMesh.position.set(-topWidth / 2, 35, 0.55);
    signGroup.add(topMesh);

    const topLight = new THREE.PointLight(0x00aaff, 30, 20, 2);
    topLight.position.set(0, 36, 2);
    signGroup.add(topLight);
    flickeringLights.push(topLight);
}

export function createFace(scene) {
    const face = new THREE.Group();
    const faceMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    const facePlane = new THREE.Mesh(new THREE.PlaneGeometry(8, 11), faceMaterial);
    face.add(facePlane);
    const featureMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.2), featureMaterial);
    leftEye.position.set(-2, 2, 0.1);
    face.add(leftEye);
    const rightEye = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.2), featureMaterial);
    rightEye.position.set(2, 2, 0.1);
    face.add(rightEye);
    const mouth = new THREE.Mesh(new THREE.PlaneGeometry(2, 3.5), featureMaterial);
    mouth.position.set(0, -2.5, 0.1);
    face.add(mouth);
    face.visible = false;
    scene.add(face);
    return face;
}
