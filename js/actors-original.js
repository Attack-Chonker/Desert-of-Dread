// js/actors-original.js
// This is the blueprint for the world as it once was. A necessary memory.

import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { Door } from './Door.js';
import { colliders, doors, flickeringLights, setCat, setCatHead, setVoidPortal, setVoidLight, addTentacle, cat } from './state.js';


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
