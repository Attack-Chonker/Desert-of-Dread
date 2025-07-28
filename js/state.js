import * as THREE from 'three';

// --- Global Variables ---
export let audioContext;
export let rumbleNode;
export let neonLights = [];
export let flickeringLights = [];
export let tvVideoElement, tvPosition, videoAudioContext, videoAudioSource, videoGainNode;
export let cat, voidPortal, voidLight, catHead, tentacles = [], moon, catMoon, moonLight, catMoonLight;
export let catState = 'idle'; 
export let catStateTimer = 0;
export const colliders = [];
export const keys = {};
export const movementSpeed = 50;
export const velocity = new THREE.Vector3();
export const direction = new THREE.Vector3();
export const clock = new THREE.Clock();
export const cameraDirection = new THREE.Vector3();
export let ghostState = 'hidden', ghostTimer = 0, nextGhostAppearance = 15.0;
export let screenShake = { intensity: 0, duration: 0 };

export function setAudioContext(context) {
    audioContext = context;
}

export function setRumbleNode(node) {
    rumbleNode = node;
}

export function setCat(newCat) {
    cat = newCat;
}

export function setVoidPortal(newVoidPortal) {
    voidPortal = newVoidPortal;
}

export function setVoidLight(newVoidLight) {
    voidLight = newVoidLight;
}

export function setCatHead(newCatHead) {
    catHead = newCatHead;
}

export function setMoon(newMoon) {
    moon = newMoon;
}

export function setCatMoon(newCatMoon) {
    catMoon = newCatMoon;
}

export function setMoonLight(newMoonLight) {
    moonLight = newMoonLight;
}

export function setCatMoonLight(newCatMoonLight) {
    catMoonLight = newCatMoonLight;
}

export function setCatState(newState) {
    catState = newState;
}

export function setCatStateTimer(newTimer) {
    catStateTimer = newTimer;
}

export function setGhostState(newState) {
    ghostState = newState;
}

export function setGhostTimer(newTimer) {
    ghostTimer = newTimer;
}

export function setNextGhostAppearance(newTime) {
    nextGhostAppearance = newTime;
}

export function setScreenShake(newScreenShake) {
    screenShake = newScreenShake;
}

export function setTvVideoElement(video) {
    tvVideoElement = video;
}

export function setTvPosition(position) {
    tvPosition = position;
}

export function setVideoAudioContext(context) {
    videoAudioContext = context;
}

export function setVideoAudioSource(source) {
    videoAudioSource = source;
}

export function setVideoGainNode(node) {
    videoGainNode = node;
}

export function addTentacle(tentacle) {
    tentacles.push(tentacle);
}

export function clearTentacles() {
    tentacles.length = 0;
}

export function getTentacles() {
    return tentacles;
} 