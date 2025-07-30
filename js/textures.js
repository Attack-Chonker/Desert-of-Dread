// js/textures.js

import * as THREE from 'three';

// This file contains helper functions for creating procedural textures.

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

export function createZigZagFloorTexture() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128; canvas.height = 64;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = '#FFFFFF';
    for (let x = 0; x < 128; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x + 16, 32); ctx.lineTo(x + 32, 0);
        ctx.closePath(); ctx.fill();
    }
    for (let x = -16; x < 128; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 64); ctx.lineTo(x + 16, 32); ctx.lineTo(x + 32, 64);
        ctx.closePath(); ctx.fill();
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
    canvas.width = 128; canvas.height = 1;
    const gradient = ctx.createLinearGradient(0, 0, 128, 0);
    if (isRed) {
        // Vibrant red for the Black Lodge
        gradient.addColorStop(0, '#5c0002');
        gradient.addColorStop(0.2, '#8b0003');
        gradient.addColorStop(0.35, '#c1121f');
        gradient.addColorStop(0.5, '#8b0003');
        gradient.addColorStop(0.7, '#5c0002');
        gradient.addColorStop(0.85, '#8b0003');
        gradient.addColorStop(1, '#680002');
    } else {
        // Original darker, browner color
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
    texture.repeat.set(50, 20);
    return texture;
}
