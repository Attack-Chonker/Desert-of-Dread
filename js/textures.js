// js/textures.js
// The skin of the world. Here we paint the patterns that define reality, from the mundane to the profane.

import * as THREE from 'three';

// This file contains helper functions for creating procedural textures.

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

    // Add noise and wear to give a worn, dusty look
    for (let i = 0; i < 10000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const alpha = Math.random() * 0.1;
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(x, y, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
}

export function createVelvetCurtainTexture(isRed = false) {
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

export function createChevronFloorTexture() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 512;

    const black = '#000000';
    const white = '#ffffff';

    ctx.fillStyle = black;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = white;
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


export function createBrickTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; // Increased resolution
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const brickWidth = 64;
    const brickHeight = 32;
    const mortar = 4;

    ctx.fillStyle = '#2a2a2a'; // Darker, grittier mortar
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += brickHeight) {
        for (let x = 0; x < 512; x += brickWidth) {
            // More muted, realistic brick colors
            const r = 110 + Math.random() * 25;
            const g = 65 + Math.random() * 15;
            const b = 55 + Math.random() * 10;
            ctx.fillStyle = `rgb(${r},${g},${b})`;

            let offsetX = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
            ctx.fillRect(x + offsetX, y, brickWidth - mortar, brickHeight - mortar);
            ctx.fillRect(x + offsetX - brickWidth, y, brickWidth - mortar, brickHeight - mortar);
        }
    }
    
    // Add grime and wear
    for (let i = 0; i < 15000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const alpha = Math.random() * 0.15;
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(x, y, 1, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
}

export function createCharredLogTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1a120b';
    ctx.fillRect(0, 0, 64, 256);

    ctx.strokeStyle = '#ff6000';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 64, Math.random() * 256);
        ctx.lineTo(Math.random() * 64, Math.random() * 256);
        ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

export function createEmberTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(7, 7, 2, 2); // small 2x2 square
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

export function createNewspaperTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e8e0d4';
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = '#333';
    ctx.font = 'bold 48px Times New Roman';
    ctx.textAlign = 'center';
    ctx.fillText('Strange Lights Over Desert', 256, 60);
    ctx.font = '16px Times New Roman';
    for (let y = 100; y < 240; y += 20) {
        ctx.fillText('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 256, y);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

export function createPlayingCardTexture(rank, suit) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 64, 96);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(2, 2, 60, 92);
    ctx.fillStyle = (suit === '♥' || suit === '♦') ? '#c00' : '#000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(rank, 32, 40);
    ctx.fillText(suit, 32, 70);
    return new THREE.CanvasTexture(canvas);
}

export function createNeonSignTexture(text, subtitle = null) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 256;

    ctx.fillStyle = 'rgba(0, 0, 0, 0)'; // Transparent background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Main text
    ctx.fillStyle = '#ffffff'; // White text, color will be applied by the material
    ctx.font = 'bold 96px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, subtitle ? canvas.height / 2 - 40 : canvas.height / 2);

    // Subtitle
    if (subtitle) {
        ctx.font = '64px sans-serif';
        ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 60);
    }

    return new THREE.CanvasTexture(canvas);
}

export function createSlotMachineTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Cherry
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(64, 64, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'green';
    ctx.fillRect(60, 20, 8, 20);

    // Bell
    ctx.fillStyle = 'gold';
    ctx.fillRect(128, 40, 64, 64);
    ctx.fillStyle = 'saddlebrown';
    ctx.fillRect(152, 104, 16, 16);

    // BAR
    ctx.fillStyle = 'black';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BAR', 224, 80);

    return new THREE.CanvasTexture(canvas);
}

export function createBlackjackCardTexture(symbol) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');

    // Card background
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, 0, 128, 192);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 124, 188);

    // Symbol drawing
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    switch (symbol) {
        case 'weeping_eye':
            ctx.font = '64px Arial';
            ctx.fillText('👁️', 64, 96);
            // Tear
            ctx.fillStyle = '#0000ff';
            ctx.beginPath();
            ctx.moveTo(64, 112);
            ctx.quadraticCurveTo(58, 132, 64, 148);
            ctx.quadraticCurveTo(70, 132, 64, 112);
            ctx.fill();
            break;
        case 'spiderweb':
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                ctx.beginPath();
                ctx.moveTo(64, 96);
                ctx.lineTo(64 + 80 * Math.cos(i * Math.PI / 4), 96 + 80 * Math.sin(i * Math.PI / 4));
                ctx.stroke();
            }
            for (let r = 20; r < 80; r += 20) {
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = i * Math.PI / 4;
                    if (i === 0) ctx.moveTo(64 + r * Math.cos(angle), 96 + r * Math.sin(angle));
                    else ctx.lineTo(64 + r * Math.cos(angle), 96 + r * Math.sin(angle));
                }
                ctx.closePath();
                ctx.stroke();
            }
            break;
        case 'cracked_mirror':
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(24, 36, 80, 120);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(24, 36);
            ctx.lineTo(104, 156);
            ctx.moveTo(104, 36);
            ctx.lineTo(24, 156);
            ctx.moveTo(50, 36);
            ctx.lineTo(80, 156);
            ctx.stroke();
            break;
        case 'screaming_mouth':
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(64, 96, 40, 0.1 * Math.PI, 0.9 * Math.PI, false);
            ctx.arc(64, 96, 30, 0.9 * Math.PI, 0.1 * Math.PI, true);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(44, 86, 40, 8);
            ctx.fillRect(44, 102, 40, 8);
            break;
    }

    return new THREE.CanvasTexture(canvas);
}

export function createRouletteSymbolTexture(symbol) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let symbolChar = '';
    switch (symbol) {
        case 'serpent': symbolChar = '§'; break;
        case 'broken_crown': symbolChar = '👑'; break; // Placeholder, ideally a custom graphic
        case 'empty_throne': symbolChar = '♄'; break;
        case 'black_star': symbolChar = '★'; break;
    }
    ctx.fillText(symbolChar, 32, 32);

    if (symbol === 'broken_crown') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(10, 54);
        ctx.lineTo(54, 10);
        ctx.stroke();
    }
     if (symbol === 'black_star') {
        ctx.fillStyle = '#000000';
        ctx.fillText('★', 32, 32);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeText('★', 32, 32);
    }


    return new THREE.CanvasTexture(canvas);
}
