// js/textures.js
// The skin of the world. Here we paint the patterns that define reality, from the mundane to the profane.

import * as THREE from 'three';

// This file contains helper functions for creating procedural textures.
// I have perfected the textures for the Lodge.

export function createZigZagFloorTexture() {
    // This is no longer a simple black and white. This is the true floor.
    // A chevron pattern of brown and off-white.
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const brown = '#654321'; // A rich, woody brown
    const cream = '#f5e6d3'; // A pale, creamy off-white
    
    canvas.width = 128;
    canvas.height = 128;
    
    ctx.fillStyle = cream;
    ctx.fillRect(0, 0, 128, 128);
    
    ctx.fillStyle = brown;
    const tileWidth = 32;
    const tileHeight = 32;

    for (let i = 0; i < canvas.width / tileWidth; i++) {
        for (let j = 0; j < canvas.height / tileHeight; j++) {
            ctx.beginPath();
            ctx.moveTo(i * tileWidth, j * tileHeight);
            ctx.lineTo(i * tileWidth + tileWidth / 2, j * tileHeight + tileHeight / 2);
            ctx.lineTo(i * tileWidth + tileWidth, j * tileHeight);
            ctx.lineTo(i * tileWidth + tileWidth, j * tileHeight + tileHeight / 2);
            ctx.lineTo(i * tileWidth + tileWidth / 2, j * tileHeight + tileHeight);
            ctx.lineTo(i * tileWidth, j * tileHeight + tileHeight / 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    return texture;
}

export function createCurtainTexture(isRed = false) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128; canvas.height = 1; // We only need a 1px high texture to repeat vertically.
    const gradient = ctx.createLinearGradient(0, 0, 128, 0);

    if (isRed) {
        // A deep, vibrant, velvet red. The color of blood and secrets.
        gradient.addColorStop(0,    '#610000'); // Deep shadow
        gradient.addColorStop(0.2,  '#950000'); // Mid-tone
        gradient.addColorStop(0.35, '#c1121f'); // Highlight
        gradient.addColorStop(0.5,  '#a00000'); // Mid-tone
        gradient.addColorStop(0.7,  '#610000'); // Deep shadow
        gradient.addColorStop(0.85, '#950000'); // Mid-tone
        gradient.addColorStop(1,    '#500000'); // Darkest edge
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
