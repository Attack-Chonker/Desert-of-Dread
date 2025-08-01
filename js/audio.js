// js/audio.js
// The soundscape of our world. From the whisper of the wind to the oppressive hum of the Lodge.

import { audioContext, setAudioContext, setRumbleNode, mainAudioNodes, lodgeAudioNodes, redRoomAudioNodes } from './state.js';
 
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
            windFilter.type = 'lowpass';
            windFilter.frequency.setValueAtTime(400, newAudioContext.currentTime);
            windFilter.Q.setValueAtTime(1, newAudioContext.currentTime);
            
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
            const maxVolume = 0.015;
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

            // Ominous hum
            const humOscillator = newAudioContext.createOscillator();
            const humGain = newAudioContext.createGain();
            humOscillator.connect(humGain);
            humGain.connect(newAudioContext.destination);
            humOscillator.type = 'sine';
            humOscillator.frequency.setValueAtTime(50, newAudioContext.currentTime);
            humGain.gain.setValueAtTime(0.005, newAudioContext.currentTime);
            humOscillator.start();

            // MDT hum
            // const mdtHum = newAudioContext.createOscillator();
            // const mdtHumGain = newAudioContext.createGain();
            // mdtHum.type = 'sine';
            // mdtHum.frequency.setValueAtTime(80, newAudioContext.currentTime); // Starts in illumination mode
            // mdtHumGain.gain.setValueAtTime(0, newAudioContext.currentTime); // Starts off
            // mdtHum.connect(mdtHumGain);
            // mdtHumGain.connect(newAudioContext.destination);
            // mdtHum.start();
            // mainAudioNodes.mdtHum = mdtHum;
            // mainAudioNodes.mdtHumGain = mdtHumGain;

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

/**
 * Manages the transition to the Red Room's unique, distorted soundscape.
 * @param {boolean} start - True to start the sequence, false to end it.
 */
export function manageRedRoomAudio(start) {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const fadeDuration = 8.0; // A long, slow, disorienting fade.

    if (start) {
        // Fade out the main world's audio.
        if (mainAudioNodes.masterGain) {
            mainAudioNodes.masterGain.gain.cancelScheduledValues(now);
            mainAudioNodes.masterGain.gain.linearRampToValueAtTime(0, now + fadeDuration);
        }

        // 1. Distorted Jukebox Music
        const songSource = audioContext.createBufferSource();
        // In a real scenario, we'd load an audio file. Here, we simulate it with noise.
        const bufferSize = audioContext.sampleRate * 10; // 10 seconds of "music"
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 0.4 - 0.2; }
        songSource.buffer = noiseBuffer;
        songSource.loop = true;

        // Pitch distortion (LFO controlling playback rate)
        const pitchLFO = audioContext.createOscillator();
        pitchLFO.type = 'sine';
        pitchLFO.frequency.setValueAtTime(0.2, now); // Slow, warping effect

        const pitchLFOGain = audioContext.createGain();
        pitchLFOGain.gain.setValueAtTime(0.1, now); // How much the pitch will vary
        
        pitchLFO.connect(pitchLFOGain);
        pitchLFOGain.connect(songSource.playbackRate);
        songSource.playbackRate.setValueAtTime(0.8, now); // Start slowed down

        // Gain for the song
        const songGain = audioContext.createGain();
        songGain.gain.setValueAtTime(0, now);
        songGain.gain.linearRampToValueAtTime(0.3, now + fadeDuration); // Fade in

        songSource.connect(songGain);
        songGain.connect(audioContext.destination);
        songSource.start(now);
        pitchLFO.start(now);

        // 2. Low Electrical Hum
        const hum = audioContext.createOscillator();
        hum.type = 'sine';
        hum.frequency.setValueAtTime(60, now); // Standard electrical hum frequency

        const humGain = audioContext.createGain();
        humGain.gain.setValueAtTime(0, now);
        humGain.gain.linearRampToValueAtTime(0.1, now + fadeDuration);

        hum.connect(humGain);
        humGain.connect(audioContext.destination);
        hum.start(now);

        redRoomAudioNodes.songSource = songSource;
        redRoomAudioNodes.pitchLFO = pitchLFO;
        redRoomAudioNodes.songGain = songGain;
        redRoomAudioNodes.hum = hum;
        redRoomAudioNodes.humGain = humGain;

    } else {
        // Fade out the Red Room audio and stop the sources.
        const fadeOutDuration = 2.0;
        if (redRoomAudioNodes.songGain) {
            redRoomAudioNodes.songGain.gain.cancelScheduledValues(now);
            redRoomAudioNodes.songGain.gain.linearRampToValueAtTime(0, now + fadeOutDuration);
            redRoomAudioNodes.songSource.stop(now + fadeOutDuration);
            redRoomAudioNodes.pitchLFO.stop(now + fadeOutDuration);
        }
        if (redRoomAudioNodes.humGain) {
            redRoomAudioNodes.humGain.gain.cancelScheduledValues(now);
            redRoomAudioNodes.humGain.gain.linearRampToValueAtTime(0, now + fadeOutDuration);
            redRoomAudioNodes.hum.stop(now + fadeOutDuration);
        }

        // Fade the main world's audio back in.
        if (mainAudioNodes.masterGain) {
            mainAudioNodes.masterGain.gain.cancelScheduledValues(now);
            mainAudioNodes.masterGain.gain.linearRampToValueAtTime(0.004, now + fadeOutDuration);
        }
    }
}
 
 export function playFlashlightClick() {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(1500, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
}

export function playMDTActivation(isOn) {
    if (!audioContext || !mainAudioNodes.mdtHumGain) return;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);

    if (isOn) {
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        if (mainAudioNodes.mdtHumGain) mainAudioNodes.mdtHumGain.gain.linearRampToValueAtTime(0.01, now + 0.1);
    } else {
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
        if (mainAudioNodes.mdtHumGain) mainAudioNodes.mdtHumGain.gain.linearRampToValueAtTime(0, now + 0.1);
    }

    osc.start(now);
    osc.stop(now + 0.1);
}

export function playMDTModeSwitch(mode) {
    if (!audioContext || !mainAudioNodes.mdtHum) return;
    const now = audioContext.currentTime;
    
    // Play a switching sound
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'square';
    osc.connect(gain);
    gain.connect(audioContext.destination);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
    osc.frequency.setValueAtTime(mode === 'diagnostic' ? 800 : 1000, now);
    osc.frequency.linearRampToValueAtTime(mode === 'diagnostic' ? 1000 : 800, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);

    // Adjust the ambient hum
    if (mode === 'diagnostic') {
        if (mainAudioNodes.mdtHum) mainAudioNodes.mdtHum.frequency.linearRampToValueAtTime(120, now + 0.2);
        if (mainAudioNodes.mdtHumGain) mainAudioNodes.mdtHumGain.gain.linearRampToValueAtTime(0.02, now + 0.2);
    } else {
        if (mainAudioNodes.mdtHum) mainAudioNodes.mdtHum.frequency.linearRampToValueAtTime(80, now + 0.2);
        if (mainAudioNodes.mdtHumGain) mainAudioNodes.mdtHumGain.gain.linearRampToValueAtTime(0.01, now + 0.2);
    }
}

export function playMDTOvercharge() {
    if (!audioContext) return;
    const now = audioContext.currentTime;

    // Electrical crackle
    const bufferSize = audioContext.sampleRate * 0.2;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 4000;
    filter.Q.value = 50;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    whiteNoise.start(now);
    whiteNoise.stop(now + 0.2);

    // Deep hum
    const hum = audioContext.createOscillator();
    const humGain = audioContext.createGain();
    hum.type = 'sawtooth';
    hum.frequency.setValueAtTime(60, now);
    hum.connect(humGain);
    humGain.connect(audioContext.destination);
    humGain.gain.setValueAtTime(0, now);
    humGain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    humGain.gain.linearRampToValueAtTime(0, now + 2.0); // Fades out over the overcharge duration
    hum.start(now);
    hum.stop(now + 2.0);
}
