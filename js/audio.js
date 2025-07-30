// js/audio.js

import { audioContext, setAudioContext, setRumbleNode, mainAudioNodes, lodgeAudioNodes } from './state.js';

export function playMeow() {
    if (!audioContext) return;
    const meowOscillator = audioContext.createOscillator();
    const meowGain = audioContext.createGain();
    meowOscillator.connect(meowGain);
    meowGain.connect(audioContext.destination);
    
    meowOscillator.type = 'sine';
    const now = audioContext.currentTime;
    meowOscillator.frequency.setValueAtTime(800, now);
    meowOscillator.frequency.exponentialRampToValueAtTime(400, now + 0.2);
    
    meowGain.gain.setValueAtTime(0.2, now);
    meowGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    
    meowOscillator.start(now);
    meowOscillator.stop(now + 0.2);
}

export function initAudio() {
    if (!audioContext) {
        try {
            const newAudioContext = new (window.AudioContext || window.webkitAudioContext)();
            setAudioContext(newAudioContext);

            // --- Wind sound ---
            const bufferSize = 2 * newAudioContext.sampleRate;
            const noiseBuffer = newAudioContext.createBuffer(1, bufferSize, newAudioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; }
            
            const whiteNoise = newAudioContext.createBufferSource();
            whiteNoise.buffer = noiseBuffer;
            whiteNoise.loop = true;
            whiteNoise.start(0);
            
            const windFilter = newAudioContext.createBiquadFilter();
            windFilter.type = 'bandpass';
            windFilter.frequency.setValueAtTime(700, newAudioContext.currentTime); 
            windFilter.Q.setValueAtTime(0.8, newAudioContext.currentTime);
            
            const gustLFO = newAudioContext.createOscillator();
            gustLFO.type = 'sine';
            gustLFO.frequency.setValueAtTime(0.2, newAudioContext.currentTime); 
            
            const gustLFOGain = newAudioContext.createGain();
            gustLFOGain.gain.setValueAtTime(80, newAudioContext.currentTime);
            gustLFO.connect(gustLFOGain);
            gustLFOGain.connect(windFilter.frequency);
            gustLFO.start(0);
            
            const masterGain = newAudioContext.createGain();
            const volumeLFO = newAudioContext.createOscillator();
            volumeLFO.type = 'sine';
            volumeLFO.frequency.setValueAtTime(1 / 22, newAudioContext.currentTime); 
            
            const volumeLFOGain = newAudioContext.createGain();
            const maxVolume = 0.008;
            volumeLFOGain.gain.setValueAtTime(maxVolume / 2, newAudioContext.currentTime); 
            volumeLFO.connect(volumeLFOGain);
            masterGain.gain.setValueAtTime(maxVolume / 2, newAudioContext.currentTime);
            volumeLFOGain.connect(masterGain.gain);
            volumeLFO.start(0);
            
            whiteNoise.connect(windFilter);
            windFilter.connect(masterGain);
            masterGain.connect(newAudioContext.destination);

            mainAudioNodes.masterGain = masterGain;
            mainAudioNodes.whiteNoise = whiteNoise;
            mainAudioNodes.windFilter = windFilter;


            // --- Rumble sound ---
            const newRumbleOscillator = newAudioContext.createOscillator();
            const newRumbleGain = newAudioContext.createGain();
            newRumbleOscillator.connect(newRumbleGain);
            newRumbleGain.connect(newAudioContext.destination);
            newRumbleOscillator.type = 'sawtooth';
            newRumbleOscillator.frequency.setValueAtTime(40, newAudioContext.currentTime);
            newRumbleGain.gain.setValueAtTime(0, newAudioContext.currentTime);
            newRumbleOscillator.start();
            setRumbleNode(newRumbleGain);

        } catch (e) { console.error("Web Audio API is not supported", e); }
    }
    if (audioContext && audioContext.state === 'suspended') { 
        audioContext.resume(); 
    }
}


/**
 * Manages the transition between ambient desert sounds and Black Lodge music.
 * @param {boolean} start - True to start lodge music, false to stop it.
 */
export function manageLodgeAudio(start) {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const fadeDuration = 3.0;

    if (start) {
        if (mainAudioNodes.masterGain) {
            mainAudioNodes.masterGain.gain.cancelScheduledValues(now);
            mainAudioNodes.masterGain.gain.linearRampToValueAtTime(0, now + fadeDuration);
        }

        const drone = audioContext.createOscillator();
        drone.type = 'sine';
        drone.frequency.setValueAtTime(55, now);

        const droneGain = audioContext.createGain();
        droneGain.gain.setValueAtTime(0, now);
        droneGain.gain.linearRampToValueAtTime(0.15, now + fadeDuration);

        drone.connect(droneGain);
        droneGain.connect(audioContext.destination);
        drone.start(now);

        lodgeAudioNodes.drone = drone;
        lodgeAudioNodes.droneGain = droneGain;

    } else {
        if (lodgeAudioNodes.droneGain) {
            lodgeAudioNodes.droneGain.gain.cancelScheduledValues(now);
            lodgeAudioNodes.droneGain.gain.linearRampToValueAtTime(0, now + fadeDuration);
            lodgeAudioNodes.drone.stop(now + fadeDuration);
        }
        
        if (mainAudioNodes.masterGain) {
            mainAudioNodes.masterGain.gain.cancelScheduledValues(now);
            mainAudioNodes.masterGain.gain.linearRampToValueAtTime(0.004, now + fadeDuration);
        }
    }
}
