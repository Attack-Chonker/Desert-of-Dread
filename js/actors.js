import * as THREE from 'three';
import * as state from './state.js';

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

    const road = new THREE.Mesh(new THREE.PlaneGeometry(8, 600), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    road.rotation.x = -Math.PI / 2;
    road.position.set(150, 0.01, -200);
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
    state.colliders.forEach(c => {
        c.updateWorldMatrix(true, false);
        c.geometry.computeBoundingBox();
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