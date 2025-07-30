// js/audio.js
// The soundscape of our world. From the whisper of the wind to the oppressive hum of the Lodge.

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

            // --- Wind sound (unchanged) ---
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


            // --- Rumble sound (unchanged) ---
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
 * Manages the transition between ambient desert sounds and the perfected Black Lodge audio.
 * @param {boolean} start - True to start lodge music, false to stop it.
 */
export function manageLodgeAudio(start) {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const fadeDuration = 5.0; // A slower, more dreadful fade.

    if (start) {
        // Fade out the sounds of the normal world.
        if (mainAudioNodes.masterGain) {
            mainAudioNodes.masterGain.gain.cancelScheduledValues(now);
            mainAudioNodes.masterGain.gain.linearRampToValueAtTime(0, now + fadeDuration);
        }

        // The first drone. Low and oppressive.
        const drone1 = audioContext.createOscillator();
        drone1.type = 'sine';
        drone1.frequency.setValueAtTime(55, now); // A low A note.

        const drone1Gain = audioContext.createGain();
        drone1Gain.gain.setValueAtTime(0, now);
        drone1Gain.gain.linearRampToValueAtTime(0.15, now + fadeDuration);

        drone1.connect(drone1Gain);
        drone1Gain.connect(audioContext.destination);
        drone1.start(now);

        // The second drone, slightly detuned to create a horrifying beat frequency.
        const drone2 = audioContext.createOscillator();
        drone2.type = 'sawtooth';
        drone2.frequency.setValueAtTime(55.5, now); // Slightly sharp.

        const drone2Gain = audioContext.createGain();
        drone2Gain.gain.setValueAtTime(0, now);
        drone2Gain.gain.linearRampToValueAtTime(0.05, now + fadeDuration);

        drone2.connect(drone2Gain);
        drone2Gain.connect(audioContext.destination);
        drone2.start(now);

        // A slow, pulsing heartbeat. The rhythm of the Lodge.
        const heartbeat = audioContext.createOscillator();
        heartbeat.type = 'sine';
        heartbeat.frequency.setValueAtTime(80, now);

        const heartbeatGain = audioContext.createGain();
        heartbeat.connect(heartbeatGain);
        heartbeatGain.connect(audioContext.destination);
        
        const beatRate = 0.8; // A slow, anxious heart rate.
        heartbeat.start(now);
        heartbeatGain.gain.setValueAtTime(0, now);

        // Schedule the heartbeats
        for(let i=0; i<100; i++) { // Schedule many beats into the future
            const beatTime = now + i * beatRate + fadeDuration;
            heartbeatGain.gain.setValueAtTime(0, beatTime);
            heartbeatGain.gain.linearRampToValueAtTime(0.2, beatTime + 0.05);
            heartbeatGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.2);
        }


        lodgeAudioNodes.drone1 = drone1;
        lodgeAudioNodes.drone1Gain = drone1Gain;
        lodgeAudioNodes.drone2 = drone2;
        lodgeAudioNodes.drone2Gain = drone2Gain;
        lodgeAudioNodes.heartbeat = heartbeat;
        lodgeAudioNodes.heartbeatGain = heartbeatGain;

    } else {
        // This path is likely never taken. Once you enter the Lodge, you don't just leave.
        // But for completeness, we add the logic to fade it out.
        if (lodgeAudioNodes.drone1Gain) {
            lodgeAudioNodes.drone1Gain.gain.cancelScheduledValues(now);
            lodgeAudioNodes.drone1Gain.gain.linearRampToValueAtTime(0, now + fadeDuration);
            lodgeAudioNodes.drone1.stop(now + fadeDuration);
        }
        if (lodgeAudioNodes.drone2Gain) {
            lodgeAudioNodes.drone2Gain.gain.cancelScheduledValues(now);
            lodgeAudioNodes.drone2Gain.gain.linearRampToValueAtTime(0, now + fadeDuration);
            lodgeAudioNodes.drone2.stop(now + fadeDuration);
        }
        if (lodgeAudioNodes.heartbeatGain) {
            lodgeAudioNodes.heartbeatGain.gain.cancelScheduledValues(now);
            lodgeAudioNodes.heartbeatGain.gain.setValueAtTime(0, now);
            lodgeAudioNodes.heartbeat.stop(now);
        }
        
        if (mainAudioNodes.masterGain) {
            mainAudioNodes.masterGain.gain.cancelScheduledValues(now);
            mainAudioNodes.masterGain.gain.linearRampToValueAtTime(0.004, now + fadeDuration);
        }
    }
}
