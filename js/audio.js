import * as state from './state.js';

export function playMeow() {
    if (!state.audioContext) return;
    const meowOscillator = state.audioContext.createOscillator();
    const meowGain = state.audioContext.createGain();
    meowOscillator.connect(meowGain);
    meowGain.connect(state.audioContext.destination);
    
    meowOscillator.type = 'sine';
    const now = state.audioContext.currentTime;
    meowOscillator.frequency.setValueAtTime(800, now);
    meowOscillator.frequency.exponentialRampToValueAtTime(400, now + 0.2);
    
    meowGain.gain.setValueAtTime(0.2, now);
    meowGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    
    meowOscillator.start(now);
    meowOscillator.stop(now + 0.2);
}

export function initAudio() {
    if (!state.audioContext) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            state.setAudioContext(audioContext);

            const bufferSize = 2 * audioContext.sampleRate;
            const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; }
            const whiteNoise = audioContext.createBufferSource();
            whiteNoise.buffer = noiseBuffer;
            whiteNoise.loop = true;
            whiteNoise.start(0);
            const windFilter = audioContext.createBiquadFilter();
            windFilter.type = 'bandpass';
            windFilter.frequency.setValueAtTime(700, audioContext.currentTime); 
            windFilter.Q.setValueAtTime(0.8, audioContext.currentTime);
            const gustLFO = audioContext.createOscillator();
            gustLFO.type = 'sine';
            gustLFO.frequency.setValueAtTime(0.2, audioContext.currentTime); 
            const gustLFOGain = audioContext.createGain();
            gustLFOGain.gain.setValueAtTime(80, audioContext.currentTime);
            gustLFO.connect(gustLFOGain);
            gustLFOGain.connect(windFilter.frequency);
            gustLFO.start(0);
            const masterGain = audioContext.createGain();
            const volumeLFO = audioContext.createOscillator();
            volumeLFO.type = 'sine';
            volumeLFO.frequency.setValueAtTime(1 / 22, audioContext.currentTime); 
            const volumeLFOGain = audioContext.createGain();
            const maxVolume = 0.008;
            volumeLFOGain.gain.setValueAtTime(maxVolume / 2, audioContext.currentTime); 
            volumeLFO.connect(volumeLFOGain);
            masterGain.gain.setValueAtTime(maxVolume / 2, audioContext.currentTime);
            volumeLFOGain.connect(masterGain.gain);
            volumeLFO.start(0);
            whiteNoise.connect(windFilter);
            windFilter.connect(masterGain);
            masterGain.connect(audioContext.destination);
            const rumbleOscillator = audioContext.createOscillator();
            const rumbleGain = audioContext.createGain();
            rumbleOscillator.connect(rumbleGain);
            rumbleGain.connect(audioContext.destination);
            rumbleOscillator.type = 'sawtooth';
            rumbleOscillator.frequency.setValueAtTime(40, audioContext.currentTime);
            rumbleGain.gain.setValueAtTime(0, audioContext.currentTime);
            rumbleOscillator.start();
            state.setRumbleNode(rumbleGain);
        } catch (e) { console.error("Web Audio API is not supported", e); }
    }
    if (state.audioContext && state.audioContext.state === 'suspended') { state.audioContext.resume(); }
} 