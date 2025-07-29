import * as THREE from 'three';

// --- Global State Management ---

// Audio
export let audioContext;
export let rumbleNode;

// Scene objects and materials
export let neonLights = [];
export let flickeringLights = [];
export let fireMaterial;
export let emberMaterial;
export const interactables = [];
export const doors = [];
export const colliders = [];

// Actors
export let cat, voidPortal, voidLight, catHead, moon, catMoon, moonLight, catMoonLight;
export let tentacles = [];

// Game State
export let catState = 'idle';
export let catStateTimer = 0;
export let ghostState = 'hidden';
export let ghostTimer = 0;
export let nextGhostAppearance = 15.0;
export let screenShake = { intensity: 0, duration: 0 };

// Player Movement
export const keys = {};
export const movementSpeed = 50;
export const velocity = new THREE.Vector3();
export const direction = new THREE.Vector3();
export const clock = new THREE.Clock();

// --- Setters for State ---
export function setAudioContext(context) { audioContext = context; }
export function setRumbleNode(node) { rumbleNode = node; }
export function setFireMaterial(material) { fireMaterial = material; }
export function setEmberMaterial(material) { emberMaterial = material; }
export function setCat(newCat) { cat = newCat; }
export function setVoidPortal(newVoidPortal) { voidPortal = newVoidPortal; }
export function setVoidLight(newVoidLight) { voidLight = newVoidLight; }
export function setCatHead(newCatHead) { catHead = newCatHead; }
export function setMoon(newMoon) { moon = newMoon; }
export function setCatMoon(newCatMoon) { catMoon = newCatMoon; }
export function setMoonLight(newMoonLight) { moonLight = newMoonLight; }
export function setCatMoonLight(newCatMoonLight) { catMoonLight = newCatMoonLight; }
export function setCatState(newState) { catState = newState; }
export function setCatStateTimer(newTimer) { catStateTimer = newTimer; }
export function setGhostState(newState) { ghostState = newState; }
export function setGhostTimer(newTimer) { ghostTimer = newTimer; }
export function setNextGhostAppearance(newTime) { nextGhostAppearance = newTime; }
export function setScreenShake(newScreenShake) { screenShake = newScreenShake; }
export function addTentacle(tentacle) { tentacles.push(tentacle); }
export function getTentacles() { return tentacles; }
