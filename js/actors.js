import * as THREE from 'three';
import * as state from './state.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { Door } from './Door.js';

export function createLightingAndWorld(scene) {
    const ambientLight = new THREE.AmbientLight(0x404050, 0.2);
    scene.add(ambientLight);
    const moonLight = new THREE.DirectionalLight(0x8a95a1, 0.6);
    moonLight.position.set(100, 200, 100);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    scene.add(moonLight);
    state.setMoonLight(moonLight);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), new THREE.MeshStandardMaterial({ color: 0x6b5a42 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const road = new THREE.Mesh(new THREE.PlaneGeometry(500, 15), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
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
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(200, 300, -800);
    moon.rotation.y = Math.PI;
    scene.add(moon);
    state.setMoon(moon);
}

export function createGasStation(scene) {
    const station = new THREE.Group();
    station.position.set(150, 0, -500);
    scene.add(station);
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2c1a, roughness: 0.8 });
    const darkWoodMaterial = new THREE.MeshStandardMaterial({ color: 0x241a0f, roughness: 0.9 });
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9, side: THREE.DoubleSide });
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
    const buildingWidth = 50, buildingDepth = 25, buildingHeight = 10, wallThickness = 0.5;
    const floor = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, wallThickness, buildingDepth), floorMaterial);
    floor.position.y = wallThickness / 2;
    floor.receiveShadow = true;
    station.add(floor);
    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, wallThickness, buildingDepth), wallMaterial);
    ceiling.position.y = buildingHeight - (wallThickness / 2);
    ceiling.castShadow = true;
    station.add(ceiling);
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, buildingHeight, wallThickness), wallMaterial);
    backWall.position.z = -buildingDepth / 2;
    backWall.position.y = buildingHeight / 2;
    station.add(backWall);
    state.colliders.push(backWall);
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, buildingHeight, buildingDepth), wallMaterial);
    rightWall.position.x = buildingWidth / 2;
    rightWall.position.y = buildingHeight / 2;
    station.add(rightWall);
    state.colliders.push(rightWall);
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, buildingHeight, buildingDepth), wallMaterial);
    leftWall.position.x = -buildingWidth / 2;
    leftWall.position.y = buildingHeight / 2;
    station.add(leftWall);
    state.colliders.push(leftWall);
    const doorWidth = 8, doorHeight = 7;
    const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth/2 - doorWidth/2, buildingHeight, wallThickness), wallMaterial);
    frontWallLeft.position.set(-(buildingWidth/4 + doorWidth/4), buildingHeight/2, buildingDepth / 2);
    station.add(frontWallLeft);
    state.colliders.push(frontWallLeft);
    const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth/2 - doorWidth/2, buildingHeight, wallThickness), wallMaterial);
    frontWallRight.position.set(buildingWidth/4 + doorWidth/4, buildingHeight/2, buildingDepth / 2);
    station.add(frontWallRight);
    state.colliders.push(frontWallRight);
    const frontWallTop = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, buildingHeight - doorHeight, wallThickness), wallMaterial);
    frontWallTop.position.set(0, doorHeight + (buildingHeight - doorHeight)/2, buildingDepth / 2);
    station.add(frontWallTop);
    state.colliders.push(frontWallTop);
    const facade = new THREE.Group();
    station.add(facade);
    const facadeSteps = [ { w: 40, h: 4, x: 0 }, { w: 35, h: 3, x: 0 }, { w: 25, h: 2, x: 0 } ];
    let currentHeight = buildingHeight;
    facadeSteps.forEach(step => {
        const facadeBlock = new THREE.Mesh(new THREE.BoxGeometry(step.w, step.h, 1), wallMaterial);
        facadeBlock.position.set(step.x, currentHeight + step.h / 2, buildingDepth / 2 + 0.5);
        facadeBlock.castShadow = true;
        facade.add(facadeBlock);
        currentHeight += step.h;
    });
    const porchDepth = 8;
    const porchFloor = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, 0.5, porchDepth), woodMaterial);
    porchFloor.position.set(0, 0.25, buildingDepth / 2 + porchDepth / 2);
    porchFloor.receiveShadow = true;
    station.add(porchFloor);
    const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, 0.5, porchDepth), darkWoodMaterial);
    porchRoof.position.set(0, buildingHeight + 0.25, buildingDepth / 2 + porchDepth / 2);
    porchRoof.castShadow = true;
    station.add(porchRoof);
    for (let i = -2; i <= 2; i++) {
        if (i === 0) continue;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, buildingHeight, 8), darkWoodMaterial);
        post.position.set(i * (buildingWidth / 4), buildingHeight / 2, buildingDepth / 2 + porchDepth - 1);
        post.castShadow = true;
        station.add(post);
        state.colliders.push(post);
    }
    const counter = new THREE.Mesh(new THREE.BoxGeometry(20, 3.5, 3), darkWoodMaterial);
    counter.position.set(0, 3.5/2, -buildingDepth/2 + 5);
    counter.castShadow = true;
    station.add(counter);
    state.colliders.push(counter);
    for(let i = 0; i < 4; i++) {
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(10, 8, 2), darkWoodMaterial);
        shelf.position.set(-buildingWidth/2 + 8, 4, -buildingDepth/2 + 10 + i * 5);
        shelf.castShadow = true;
        station.add(shelf);
        state.colliders.push(shelf);
    }
    function createChessboard() {
        const boardGroup = new THREE.Group();
        const tileSize = 0.8;
        const boardSize = 8 * tileSize;
        const darkSquareMaterial = new THREE.MeshStandardMaterial({ color: 0x402218 });
        const lightSquareMaterial = new THREE.MeshStandardMaterial({ color: 0xE8DAB2 });
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const isLight = (i + j) % 2 !== 0;
                const tileMaterial = isLight ? lightSquareMaterial : darkSquareMaterial;
                const tile = new THREE.Mesh(new THREE.PlaneGeometry(tileSize, tileSize), tileMaterial);
                tile.position.set(i * tileSize - boardSize / 2 + tileSize / 2, j * tileSize - boardSize / 2 + tileSize / 2, 0);
                boardGroup.add(tile);
            }
        }
        boardGroup.position.set(0, buildingHeight - 0.3, 0);
        boardGroup.rotation.x = Math.PI / 2;
        station.add(boardGroup);
    }
    createChessboard();
    const neonMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const neonRadius = 0.1;
    const outlinePoints = [
        new THREE.Vector3(-buildingWidth/2, buildingHeight, buildingDepth/2 + 1), new THREE.Vector3(buildingWidth/2, buildingHeight, buildingDepth/2 + 1),
        new THREE.Vector3(buildingWidth/2, buildingHeight, buildingDepth/2 + 1), new THREE.Vector3(buildingWidth/2, buildingHeight + facadeSteps[0].h, buildingDepth/2 + 1),
        new THREE.Vector3(20, 14, 13.5), new THREE.Vector3(17.5, 14, 13.5),
        new THREE.Vector3(17.5, 14, 13.5), new THREE.Vector3(17.5, 17, 13.5),
        new THREE.Vector3(17.5, 17, 13.5), new THREE.Vector3(12.5, 17, 13.5),
        new THREE.Vector3(12.5, 17, 13.5), new THREE.Vector3(12.5, 19, 13.5),
        new THREE.Vector3(12.5, 19, 13.5), new THREE.Vector3(-12.5, 19, 13.5),
        new THREE.Vector3(-12.5, 19, 13.5), new THREE.Vector3(-12.5, 17, 13.5),
        new THREE.Vector3(-12.5, 17, 13.5), new THREE.Vector3(-17.5, 17, 13.5),
        new THREE.Vector3(-17.5, 17, 13.5), new THREE.Vector3(-17.5, 14, 13.5),
        new THREE.Vector3(-17.5, 14, 13.5), new THREE.Vector3(-20, 14, 13.5),
        new THREE.Vector3(-buildingWidth/2, buildingHeight + facadeSteps[0].h, buildingDepth/2 + 1), new THREE.Vector3(-buildingWidth/2, buildingHeight, buildingDepth/2 + 1),
    ];
    for (let i = 0; i < outlinePoints.length; i += 2) {
        const start = outlinePoints[i];
        const end = outlinePoints[i+1];
        const path = new THREE.LineCurve3(start, end);
        const tube = new THREE.Mesh(new THREE.TubeGeometry(path, 1, neonRadius, 8, false), neonMaterial);
        station.add(tube);
        const neonLight = new THREE.PointLight(0xff0000, 150, 50, 2);
        neonLight.position.copy(start.clone().lerp(end, 0.5));
        station.add(neonLight);
        state.neonLights.push(neonLight);
    }
}

function createZigZagFloorTexture() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 64; // The pattern repeats vertically

    ctx.fillStyle = '#000000'; // black background
    ctx.fillRect(0, 0, 128, 64);

    ctx.fillStyle = '#FFFFFF'; // white zig-zags

    // Draw one row of white "up" triangles
    for (let x = 0; x < 128; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 16, 32);
        ctx.lineTo(x + 32, 0);
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw one row of white "down" triangles
    for (let x = -16; x < 128; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 64);
        ctx.lineTo(x + 16, 32);
        ctx.lineTo(x + 32, 64);
        ctx.closePath();
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16); // Tile it
    return texture;
}

function createCurtainTexture() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128; // Larger for more detail
    canvas.height = 1;   // The pattern is purely vertical

    // Create a gradient that simulates a single fold
    const gradient = ctx.createLinearGradient(0, 0, 128, 0);
    gradient.addColorStop(0, '#2c0001');    // Deep shadow
    gradient.addColorStop(0.2, '#5c0002');  // Main color
    gradient.addColorStop(0.35, '#8b0003'); // Highlight
    gradient.addColorStop(0.5, '#5c0002');  // Main color
    gradient.addColorStop(0.7, '#2c0001');  // Deep shadow
    gradient.addColorStop(0.85, '#5c0002'); // Main color
    gradient.addColorStop(1, '#4c0001');    // Shadow

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 1);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(50, 20); // Tile it across the surface
    return texture;
}

export function createSaloon(scene) {
    const saloon = new THREE.Group();
    saloon.position.set(-150, 0, -500); // Opposite the gas station
    scene.add(saloon);

    // --- Materials ---
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2c1a, roughness: 0.8 });
    const darkWoodMaterial = new THREE.MeshStandardMaterial({ color: 0x241a0f, roughness: 0.9 });
    const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.9 });
    const curtainTexture = createCurtainTexture();
    const curtainMaterial = new THREE.MeshStandardMaterial({ map: curtainTexture, roughness: 0.7 });
    const zigZagFloorMaterial = new THREE.MeshStandardMaterial({ map: createZigZagFloorTexture() });
    const exteriorMaterial = darkWoodMaterial;
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x9a7142, roughness: 0.8 });


    const buildingWidth = 40, buildingDepth = 30, buildingHeight = 12, wallThickness = 0.5;

    // Floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, wallThickness, buildingDepth), zigZagFloorMaterial);
    floor.position.y = wallThickness / 2;
    floor.receiveShadow = true;
    saloon.add(floor);

    // Ceiling
    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, wallThickness, buildingDepth), darkWoodMaterial);
    ceiling.position.y = buildingHeight - (wallThickness / 2);
    ceiling.castShadow = true;
    saloon.add(ceiling);

    // --- Overhead Lighting ---
    const overheadLight = new THREE.PointLight(0xfff0e1, 0.7, 60, 1.5);
    overheadLight.position.set(0, buildingHeight - 2, 0);
    saloon.add(overheadLight);

    // --- Walls (Exterior Shell and Interior Curtains as separate planes) ---
    function createWall(width, height, position, rotationY = 0) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, wallThickness), exteriorMaterial);
        wall.position.copy(position);
        wall.rotation.y = rotationY;
        saloon.add(wall);
        state.colliders.push(wall);
    }
    
    // Back Wall
    createWall(buildingWidth, buildingHeight, new THREE.Vector3(0, buildingHeight / 2, -buildingDepth / 2));
    const backCurtain = new THREE.Mesh(new THREE.PlaneGeometry(buildingWidth, buildingHeight), curtainMaterial);
    backCurtain.position.set(0, buildingHeight / 2, -buildingDepth / 2 + wallThickness);
    saloon.add(backCurtain);
    
    // Left Wall
    createWall(buildingDepth, buildingHeight, new THREE.Vector3(-buildingWidth / 2, buildingHeight / 2, 0), Math.PI / 2);
    const leftCurtain = new THREE.Mesh(new THREE.PlaneGeometry(buildingDepth, buildingHeight), curtainMaterial);
    leftCurtain.position.set(-buildingWidth / 2 + wallThickness, buildingHeight / 2, 0);
    leftCurtain.rotation.y = Math.PI / 2;
    saloon.add(leftCurtain);

    // Right Wall (Stone)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, buildingHeight, buildingDepth), stoneMaterial);
    rightWall.position.x = buildingWidth / 2;
    rightWall.position.y = buildingHeight / 2;
    saloon.add(rightWall);
    state.colliders.push(rightWall);
    
    // Front Wall sections
    const doorWidth = 8, doorHeight = 7;
    const frontWallSideWidth = (buildingWidth / 2) - (doorWidth / 2);
    createWall(frontWallSideWidth, buildingHeight, new THREE.Vector3(-(doorWidth + frontWallSideWidth) / 2, buildingHeight / 2, buildingDepth / 2));
    createWall(frontWallSideWidth, buildingHeight, new THREE.Vector3((doorWidth + frontWallSideWidth) / 2, buildingHeight / 2, buildingDepth / 2));
    createWall(doorWidth, buildingHeight - doorHeight, new THREE.Vector3(0, doorHeight + (buildingHeight - doorHeight) / 2, buildingDepth / 2));
    
    const frontCurtainLeft = new THREE.Mesh(new THREE.PlaneGeometry(frontWallSideWidth, buildingHeight), curtainMaterial);
    frontCurtainLeft.position.set(-(doorWidth + frontWallSideWidth) / 2, buildingHeight / 2, buildingDepth / 2 - wallThickness);
    frontCurtainLeft.rotation.y = Math.PI;
    saloon.add(frontCurtainLeft);

    const frontCurtainRight = new THREE.Mesh(new THREE.PlaneGeometry(frontWallSideWidth, buildingHeight), curtainMaterial);
    frontCurtainRight.position.set((doorWidth + frontWallSideWidth) / 2, buildingHeight / 2, buildingDepth / 2 - wallThickness);
    frontCurtainRight.rotation.y = Math.PI;
    saloon.add(frontCurtainRight);

    const frontCurtainTop = new THREE.Mesh(new THREE.PlaneGeometry(doorWidth, buildingHeight - doorHeight), curtainMaterial);
    frontCurtainTop.position.set(0, doorHeight + (buildingHeight - doorHeight) / 2, buildingDepth / 2 - wallThickness);
    frontCurtainTop.rotation.y = Math.PI;
    saloon.add(frontCurtainTop);


    // --- Saloon Doors ---
    const doorPositionLeft = new THREE.Vector3(-doorWidth / 2, doorHeight / 2, buildingDepth / 2);
    const doorPositionRight = new THREE.Vector3(doorWidth / 2, doorHeight / 2, buildingDepth / 2);

    const leftDoor = new Door(true, doorWidth, doorHeight, doorMaterial, doorPositionLeft);
    leftDoor.addToScene(saloon);
    state.doors.push(leftDoor);

    const rightDoor = new Door(false, doorWidth, doorHeight, doorMaterial, doorPositionRight);
    rightDoor.addToScene(saloon);
    state.doors.push(rightDoor);


    // The Bar
    const barHeight = 4, barDepth = 3, barWidth = buildingWidth - 10;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(barWidth, barHeight, barDepth), darkWoodMaterial);
    bar.position.set(0, barHeight / 2, -buildingDepth / 2 + barDepth / 2 + 5); // Moved forward
    bar.castShadow = true;
    saloon.add(bar);
    state.colliders.push(bar);

    // --- Bar Shelves and Bottles ---
    const shelfMaterial = darkWoodMaterial;
    const shelfWidth = buildingWidth - 4;
    const shelfHeight = 0.3;
    const shelfDepth = 1.5;

    function createShelf(y) {
        const shelf = new THREE.Mesh(
            new THREE.BoxGeometry(shelfWidth, shelfHeight, shelfDepth),
            shelfMaterial
        );
        shelf.position.set(0, y, -buildingDepth / 2 + shelfDepth / 2);
        shelf.castShadow = true;
        saloon.add(shelf);
        return shelf;
    }

    function createBottle() {
        const bottleArchetypes = [
            { // Standard wine bottle
                points: [
                    new THREE.Vector2(0, 0), new THREE.Vector2(0.25, 0),
                    new THREE.Vector2(0.28, 0.4), new THREE.Vector2(0.1, 0.9),
                    new THREE.Vector2(0.12, 1.2), new THREE.Vector2(0.05, 1.3),
                    new THREE.Vector2(0, 1.3)
                ], scale: 1.05
            },
            { // Whiskey bottle
                points: [
                    new THREE.Vector2(0, 0), new THREE.Vector2(0.3, 0),
                    new THREE.Vector2(0.3, 0.6), new THREE.Vector2(0.28, 0.8),
                    new THREE.Vector2(0.1, 1.0), new THREE.Vector2(0, 1.0)
                ], scale: 1.0
            },
            { // Tall, slender bottle
                points: [
                    new THREE.Vector2(0, 0), new THREE.Vector2(0.15, 0),
                    new THREE.Vector2(0.15, 1.0), new THREE.Vector2(0.08, 1.3),
                    new THREE.Vector2(0.1, 1.4), new THREE.Vector2(0, 1.4)
                ], scale: 1.1
            },
            { // Short, round bottle
                points: [
                    new THREE.Vector2(0, 0), new THREE.Vector2(0.1, 0),
                    new THREE.Vector2(0.35, 0.2), new THREE.Vector2(0.3, 0.5),
                    new THREE.Vector2(0.1, 0.8), new THREE.Vector2(0, 0.8)
                ], scale: 0.95
            }
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
        const shelf = createShelf(y);
        let currentX = -shelfWidth / 2 + 0.5;
        while (currentX < shelfWidth / 2 - 0.5) {
            const bottleGroup = createBottle();
            
            bottleGroup.userData.geometry.computeBoundingBox();
            const bottleWidth = bottleGroup.userData.geometry.boundingBox.max.x - bottleGroup.userData.geometry.boundingBox.min.x;
            
            bottleGroup.position.set(
                currentX + bottleWidth / 2,
                y + shelfHeight / 2,
                shelf.position.z + (Math.random() - 0.5) * shelfDepth * 0.5
            );
            saloon.add(bottleGroup);

            currentX += bottleWidth + (Math.random() * 0.05 + 0.02);
        }
        const shelfLight = new THREE.RectAreaLight(0xffd580, 2, shelfWidth - 1, 0.2);
        shelfLight.position.set(0, y - 0.2, shelf.position.z);
        shelfLight.lookAt(0, y - 1, shelf.position.z);
        saloon.add(shelfLight);
    });


    // --- Fireplace Assembly ---
    const fireplaceAssembly = new THREE.Group();
    saloon.add(fireplaceAssembly);

    // --- Dimensions ---
    const chimneyWidth = 7;
    const chimneyDepth = 3;
    const openingWidth = 5;
    const openingHeight = 4;

    // --- Positioning and Rotation ---
    // Place it on the right wall, facing inwards.
    const assemblyX = buildingWidth / 2 - chimneyDepth / 2;
    fireplaceAssembly.position.set(assemblyX, 0, 0);
    fireplaceAssembly.rotation.y = -Math.PI / 2; // Rotate the whole thing to face into the tavern.

    // --- Chimney (relative to the rotated assembly) ---
    const chimney = new THREE.Mesh(
        new THREE.BoxGeometry(chimneyWidth, buildingHeight + 5, chimneyDepth),
        stoneMaterial
    );
    chimney.position.y = (buildingHeight + 5) / 2;
    fireplaceAssembly.add(chimney);
    state.colliders.push(chimney);

    // --- Hearth ---
    const hearth = new THREE.Mesh(
        new THREE.BoxGeometry(chimneyWidth + 2, 0.5, chimneyDepth + 1),
        stoneMaterial
    );
    hearth.position.y = 0.25;
    fireplaceAssembly.add(hearth);
    state.colliders.push(hearth);

    // --- Porch Lights ---
    function createPorchLight(x, isFlickering) {
        const porchLight = new THREE.SpotLight(0xffd580, 20, 30, Math.PI * 0.4, 0.5, 2);
        porchLight.position.set(x, buildingHeight, buildingDepth / 2 + 3); // Moved up and slightly forward
        porchLight.castShadow = true;
        
        // Aim the light downwards at the door area
        const target = new THREE.Object3D();
        target.position.set(x, 0, buildingDepth / 2); // Target the base of the wall
        saloon.add(target);
        porchLight.target = target;
        
        saloon.add(porchLight);

        if (isFlickering) {
            state.flickeringLights.push(porchLight);
        }
    }

    createPorchLight(0, false);                      // Center
    createPorchLight(-buildingWidth / 2 + 6, true);  // Left (flickering)
    createPorchLight(buildingWidth / 2 - 6, false); // Right

    // --- The Fire (Video Screen) ---
    const video = document.createElement('video');
    video.src = 'assets/fireplace.mp4';
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    state.setTvVideoElement(video);

    const videoTexture = new THREE.VideoTexture(video);
    const fireScreenMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
    const fireScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(openingWidth, openingHeight),
        fireScreenMaterial
    );

    // Position the fire inside the chimney opening
    fireScreen.position.set(0, openingHeight / 2 + 0.5, chimneyDepth / 2 + 0.01); // Bring it just in front of the chimney face
    fireplaceAssembly.add(fireScreen);

    // --- Firelight ---
    const fireLight = new THREE.PointLight(0xffaa33, 1, 30, 2);
    fireLight.position.set(0, openingHeight / 2 + 1, chimneyDepth / 2 + 1);
    fireplaceAssembly.add(fireLight);
    state.flickeringLights.push(fireLight);

    // --- Update audio position ---
    const audioPosition = new THREE.Vector3();
    fireScreen.getWorldPosition(audioPosition); // Get world position of the screen itself
    state.setTvPosition(audioPosition);

    // Porch
    const porchDepth = 10;
    const porchFloor = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, 0.5, porchDepth), woodMaterial);
    porchFloor.position.set(0, 0.25, buildingDepth / 2 + porchDepth / 2);
    porchFloor.receiveShadow = true;
    saloon.add(porchFloor);

    const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, 0.5, porchDepth), darkWoodMaterial);
    porchRoof.position.set(0, buildingHeight + 0.25, buildingDepth / 2 + porchDepth / 2);
    porchRoof.castShadow = true;
    saloon.add(porchRoof);

    for (let i = -1; i <= 1; i++) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, buildingHeight, 8), darkWoodMaterial);
        post.position.set(i * (buildingWidth / 2.5), buildingHeight / 2, buildingDepth / 2 + porchDepth - 1);
        post.castShadow = true;
        saloon.add(post);
        state.colliders.push(post);
    }

    // Add a simple sign
    const sign = new THREE.Mesh(new THREE.BoxGeometry(12, 5, 0.5), woodMaterial);
    sign.position.set(0, buildingHeight + 5, buildingDepth/2);
    saloon.add(sign);

    const loader = new FontLoader();
    loader.load('https://cdn.jsdelivr.net/npm/three@0.165.0/examples/fonts/helvetiker_bold.typeface.json', function (font) {
        const textMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            emissive: 0xFFD700,
            emissiveIntensity: 1
        });
        const text = "Tachonker's Tavern";
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: 1.5,
            height: 0.2,
        });
        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-textWidth / 2, buildingHeight + 4, buildingDepth / 2 + 0.3);
        saloon.add(textMesh);

        // Add individual lights for flickering effect
        const lettersToFlicker = ["T", "a", "c", "h", "o", "n", "k", "e", "r", "'", "s", " ", "T", "a", "v", "e", "r", "n"];
        let xOffset = 0;
        for (let i = 0; i < text.length; i++) {
            const letter = text[i];
            if (letter === ' ') {
                xOffset += 0.5; // Adjust space width as needed
                continue;
            }
            const letterGeom = new TextGeometry(letter, {
                font: font,
                size: 1.5,
                height: 0.2,
            });
            letterGeom.computeBoundingBox();
            const letterWidth = letterGeom.boundingBox.max.x - letterGeom.boundingBox.min.x;

            if (['a', 'c', 'o', 'r'].includes(letter.toLowerCase())) {
                const letterLight = new THREE.PointLight(0xFFD700, 2, 5, 2);
                letterLight.position.set(-textWidth / 2 + xOffset + letterWidth / 2, buildingHeight + 5, buildingDepth / 2 + 1);
                saloon.add(letterLight);
                state.flickeringLights.push(letterLight);
            }
            xOffset += letterWidth;
        }
    });
}

export function createCat(scene) {
    const cat = new THREE.Group();
    scene.add(cat);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    const accentMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.8 });
    const innerEarMaterial = new THREE.MeshStandardMaterial({ color: 0xdb7093, roughness: 0.9 });
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffc940 });
    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(1.4, 20, 16), bodyMaterial);
    bodyMesh.scale.set(1, 1.2, 0.9);
    bodyMesh.position.y = (1.4 * 1.2) / 2;
    bodyMesh.castShadow = true;
    cat.add(bodyMesh);
    const catHead = new THREE.Group();
    cat.add(catHead);
    catHead.position.y = (1.4 * 1.2) + 0.5;
    catHead.position.z = 0.2;
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.8, 20, 16), bodyMaterial);
    headMesh.castShadow = true;
    catHead.add(headMesh);
    const eyeRadius = 0.15;
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(eyeRadius, 12, 8), eyeMaterial);
    leftEye.position.set(0.3, 0.15, 0.7);
    leftEye.name = "leftEye";
    catHead.add(leftEye);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(eyeRadius, 12, 8), eyeMaterial);
    rightEye.position.set(-0.3, 0.15, 0.7);
    rightEye.name = "rightEye";
    catHead.add(rightEye);
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius * 0.6, 12), pupilMaterial);
    pupil.position.z = 0.7 + eyeRadius + 0.01;
    const leftPupil = pupil.clone();
    leftPupil.position.x = 0.3;
    leftPupil.position.y = 0.15;
    const rightPupil = pupil.clone();
    rightPupil.position.x = -0.3;
    rightPupil.position.y = 0.15;
    catHead.add(leftPupil, rightPupil);
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
    catHead.add(leftEar, rightEar);
    const leg = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8), bodyMaterial);
    leg.scale.set(0.8 * 0.7, 1.8 * 0.7, 0.8 * 0.7);
    leg.position.y = 0.6;
    leg.position.z = 1;
    leg.castShadow = true;
    const leftLeg = leg.clone();
    leftLeg.position.x = 0.45;
    const rightLeg = leg.clone();
    rightLeg.position.x = -0.45;
    cat.add(leftLeg, rightLeg);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 8), accentMaterial);
    paw.scale.set(1.1 * 0.7, 0.7 * 0.7, 1 * 0.7);
    paw.position.y = 0.2;
    paw.position.z = 1.2;
    paw.castShadow = true;
    const leftPaw = paw.clone();
    leftPaw.position.x = 0.45;
    const rightPaw = paw.clone();
    rightPaw.position.x = -0.45;
    cat.add(leftPaw, rightPaw);
    const tailCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.8, -0.6), new THREE.Vector3(-0.8, 0.4, -1.0),
        new THREE.Vector3(-1.5, 0.15, -0.4), new THREE.Vector3(-1.8, 0.1, 0.3),
    ]);
    const tailGeometry = new THREE.TubeGeometry(tailCurve, 32, 0.2, 8, false);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.castShadow = true;
    cat.add(tail);
    cat.position.set(150, 0, -515);
    cat.rotation.y = Math.PI;

    state.setCat(cat);
    state.setCatHead(catHead);
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
    const voidPortal = new THREE.Mesh(portalGeometry, portalMaterial);
    voidPortal.position.set(150, 0.1, -515);
    voidPortal.rotation.x = -Math.PI / 2;
    voidPortal.scale.set(0, 0, 0);
    scene.add(voidPortal);
    state.setVoidPortal(voidPortal);

    const voidLight = new THREE.PointLight(0x440044, 0, 30, 2);
    voidLight.position.set(150, 2, -515);
    scene.add(voidLight);
    state.setVoidLight(voidLight);

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
        tentacle.position.set(voidPortal.position.x + Math.cos(angle) * radius, -10, voidPortal.position.z + Math.sin(angle) * radius);
        tentacle.userData.angle = angle;
        tentacle.userData.radius = radius;
        tentacle.visible = false;
        scene.add(tentacle);
        state.addTentacle(tentacle);
    }
}

export function createTrashCans(scene) {
    const canMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.7, roughness: 0.5 });
    const createCan = (x, z, rotation) => {
        const canGroup = new THREE.Group(); scene.add(canGroup);
        canGroup.position.set(x, 0, z); canGroup.rotation.y = rotation;
        const body = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 4, 12), canMaterial);
        body.position.y = 2; body.castShadow = true; canGroup.add(body); state.colliders.push(body);
        const lid = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.3, 12), canMaterial);
        lid.position.y = 4.15; lid.castShadow = true; lid.rotation.x = Math.PI / 16; canGroup.add(lid);
    };
    createCan(147, -515, Math.PI / 8); createCan(153, -515, -Math.PI / 12);
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
        const x = (Math.random() - 0.5) * 500;
        const z = (Math.random() - 0.5) * 500;
        if (x*x + z*z > 100) {
            if (Math.random() > 0.5) createCactus(x, z);
            else createShrub(x, z);
        }
    }
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