// js/state.js
// This is the collective unconscious of our world. Every secret, every fear, every variable is stored here.

import * as THREE from 'three';

// --- Global State Management ---

// Audio
export let audioContext;
export let rumbleNode;
export const mainAudioNodes = {};
export const lodgeAudioNodes = {};
export const redRoomAudioNodes = {};
export const casinoAudioNodes = {};

export let ruinVisionActive = false;
export let surveillanceAlertActive = false;


// Scene objects and materials
export let flickeringLights = [];
export const interactables = [];
export const doors = [];
export const colliders = [];

// Actors
export let cat, voidPortal, voidLight, catHead, moon, catMoon, moonLight, catMoonLight;
export let tentacles = [];
export let storeFan;
export let storeClerk;
export let storeClerkHead;
export let storeClerkEyes;
export let storeCoolerGlow;
export let storeCounterLamp;
export let storeInteriorLight;

// Twin Peaks / Black Lodge state
export let rocket;
export let isPlayerInRocket = false;
export let isRocketRideActive = false;
export let lodgeState = 'inactive'; // 'inactive', 'transitioning', 'active'
export let redRoomState = 'inactive'; // 'inactive', 'transitioning', 'active', 'exiting'
export let roadhouseInterior, blackLodge, lodgeStrobe, fireplaceBacking;
export let roadhouseLights = [];
export let jukebox, redRoom;
export let hasOwlCaveCoin = false; // Player starts without the coin.
export let canExitLodge = false; // Player cannot exit the lodge initially.
// We must keep track of the inhabitants of the Lodge.
export let lodgeMan, lodgeStatue, doppelganger, lauraDoppelganger;
export let redRoomMan;

// Velvet Hand Casino state
export let velvetHandCasino;
export let casinoState = 'inactive'; // 'inactive', 'active', 'jackpot', 'woodsman'
export let woodsman;
export let slotMachine;
export let hasCigaretteButt = false;
export let hasDeadFly = false;
export let casinoPsychicDebt = 0;
export let woodsmanOutcome = null; // 'possession' | 'memory_loss'


// Game State
export let catState = 'idle';
export let catStateTimer = 0;
export let ghostState = 'hidden';
export let ghostTimer = 0;
export let nextGhostAppearance = 15.0;
export let screenShake = { intensity: 0, duration: 0 };
export let mdt = {
    light: null,
    isOn: false,
    powerCell: 100, // Percentage
    mode: 'illumination', // 'illumination' or 'diagnostic'
    baseIntensity: 1.0,
    beamColor: new THREE.Color(0xffffff), // Pure white
    isOvercharging: false,
    overchargeTimer: 0
};


// Player Movement
export const keys = {};
export let movementSpeed = 50;
export const velocity = new THREE.Vector3();
export const direction = new THREE.Vector3();
export const clock = new THREE.Clock();
export let playerHasLighter = true; // For testing the Woodsman interaction

// --- Setters for State ---
// These functions are the gatekeepers, allowing us to modify the state of the world.
export function setAudioContext(context) { audioContext = context; }
export function setRumbleNode(node) { rumbleNode = node; }
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
export function setStoreFan(fan) { storeFan = fan; }
export function setStoreClerk(clerk) { storeClerk = clerk; }
export function setStoreClerkHead(head) { storeClerkHead = head; }
export function setStoreClerkEyes(eyes) { storeClerkEyes = eyes; }
export function setStoreCoolerGlow(light) { storeCoolerGlow = light; }
export function setStoreCounterLamp(light) { storeCounterLamp = light; }
export function setStoreInteriorLight(light) { storeInteriorLight = light; }

export function setRocket(newRocket) { rocket = newRocket; }
export function setIsPlayerInRocket(value) { isPlayerInRocket = value; }
export function setIsRocketRideActive(value) { isRocketRideActive = value; }
 
 // Lodge Setters
export function setLodgeState(newState) { lodgeState = newState; }
export function setRoadhouseInterior(group) { roadhouseInterior = group; }
export function setBlackLodge(group) { blackLodge = group; }
export function setLodgeStrobe(light) { lodgeStrobe = light; }
export function setFireplaceBacking(mesh) { fireplaceBacking = mesh; }
export function setLodgeMan(man) { lodgeMan = man; }
export function setLodgeStatue(statue) { lodgeStatue = statue; }
export function setDoppelganger(ganger) { doppelganger = ganger; }
export function setLauraDoppelganger(laura) { lauraDoppelganger = laura; }
export function setCanExitLodge(value) { canExitLodge = value; }

// Velvet Hand Casino Setters
export function setVelvetHandCasino(casino) { velvetHandCasino = casino; }
export function setCasinoState(newState) { casinoState = newState; }
export function setWoodsman(newWoodsman) { woodsman = newWoodsman; }
export function setSlotMachine(newSlotMachine) { slotMachine = newSlotMachine; }
export function setHasCigaretteButt(value) { hasCigaretteButt = value; }
export function setHasDeadFly(value) { hasDeadFly = value; }
export function setCasinoPsychicDebt(value) { casinoPsychicDebt = value; }
export function setWoodsmanOutcome(value) { woodsmanOutcome = value; }
export function setRuinVisionActive(value) { ruinVisionActive = value; }
export function setSurveillanceAlertActive(value) { surveillanceAlertActive = value; }

// Red Room Setters
export function setRedRoomState(newState) { redRoomState = newState; }
export function setJukebox(juke) { jukebox = juke; }
export function setRedRoom(room) { redRoom = room; }
export function setHasOwlCaveCoin(value) { hasOwlCaveCoin = value; }
export function setMovementSpeed(speed) { movementSpeed = speed; }
export function setRedRoomMan(man) { redRoomMan = man; }
