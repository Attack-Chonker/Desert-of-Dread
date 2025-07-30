// js/actors-original.js
// This is the blueprint for the world as it once was. A necessary memory.

import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { Door } from './Door.js';
import { createBrickTexture, createCurtainTexture } from './textures.js';
import { colliders, doors, flickeringLights, setMoonLight, setMoon, setCat, setCatHead, setVoidPortal, setVoidLight, addTentacle, cat, interactables, saloonLights, setSaloonInterior, setBlackLodge, setLodgeStrobe, setFireplaceBacking } from './state.js';

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
