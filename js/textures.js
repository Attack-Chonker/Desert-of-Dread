// js/textures.js
// The skin of the world. Here we paint the patterns that define reality, from the mundane to the profane.

import * as THREE from 'three';

// This file contains helper functions for creating procedural textures.
// I have perfected the textures for the Lodge.

export function createZigZagFloorTexture() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 512;

    const brown = '#4d2c1a';
    const cream = '#e0dacd';

    ctx.fillStyle = brown;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = cream;
    ctx.lineWidth = 40;
    ctx.beginPath();
    for (let i = -1; i < 14; i++) {
        ctx.moveTo(i * 40, -10);
        ctx.lineTo((i + 0.5) * 40, 30);
        ctx.lineTo((i + 1) * 40, -10);
    }
    for (let j = 0; j < 13; j++) {
        for (let i = -1; i < 14; i++) {
            ctx.moveTo(i * 40, j * 40 + 30);
            ctx.lineTo((i + 0.5) * 40, j * 40 + 70);
            ctx.lineTo((i + 1) * 40, j * 40 + 30);
        }
    }
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
}

export function createCurtainTexture(isRed = false) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128; canvas.height = 1; // We only need a 1px high texture to repeat vertically.
    const gradient = ctx.createLinearGradient(0, 0, 128, 0);

    if (isRed) {
        // A deep, vibrant, velvet red. The color of blood and secrets.
        gradient.addColorStop(0,    '#400000');
        gradient.addColorStop(0.2,  '#8b0000');
        gradient.addColorStop(0.35, '#c1121f');
        gradient.addColorStop(0.5,  '#a00000');
        gradient.addColorStop(0.7,  '#610000');
        gradient.addColorStop(0.85, '#950000');
        gradient.addColorStop(1,    '#500000');
    } else {
        // Original darker, browner color for other uses if needed.
        gradient.addColorStop(0, '#2c0001');
        gradient.addColorStop(0.2, '#5c0002');
        gradient.addColorStop(0.35, '#8b0003');
        gradient.addColorStop(0.5, '#5c0002');
        gradient.addColorStop(0.7, '#2c0001');
        gradient.addColorStop(0.85, '#5c0002');
        gradient.addColorStop(1, '#4c0001');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 1);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(50, 20); // Repeat many times to create the folds.
    return texture;
}


export function createBrickTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const brickWidth = 64;
    const brickHeight = 32;
    const mortar = 4;

    ctx.fillStyle = '#3a2d27'; // Darker Mortar color
    ctx.fillRect(0, 0, 256, 256);

    for (let y = 0; y < 256; y += brickHeight) {
        for (let x = 0; x < 256; x += brickWidth) {
            const r = 140 + Math.random() * 20;
            const g = 75 + Math.random() * 15;
            const b = 63 + Math.random() * 10;
            ctx.fillStyle = `rgb(${r},${g},${b})`;

            let offsetX = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
            ctx.fillRect(x + offsetX, y, brickWidth - mortar, brickHeight - mortar);
            ctx.fillRect(x + offsetX - brickWidth, y, brickWidth - mortar, brickHeight - mortar);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
}
