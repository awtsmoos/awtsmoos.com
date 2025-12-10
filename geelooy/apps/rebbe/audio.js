//B"H
// audio.js - Pure Web Audio API Implementation

let audioCtx;
let sourceNode;
let analyser;
let audioBuffer;
let gainNode;

// Playback state
let startTime = 0; // Context time when playback started
let pauseOffset = 0; // Offset in seconds
let isPlayingFlag = false;
let callbacks = { onUpdate: null, onEnd: null, onError: null };
let animationFrameId;

export function init() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    gainNode = audioCtx.createGain();
    gainNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    // Resume context if suspended (browser policy)
    const resume = () => { if(audioCtx.state==='suspended') audioCtx.resume(); };
    document.addEventListener('click', resume, { once: true });
    document.addEventListener('touchstart', resume, { once: true });
}

function resumeContext() {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

export function setCallbacks(cbs) {
    callbacks = { ...callbacks, ...cbs };
    if(!audioCtx) init();
}

export function getBuffer() {
    return audioBuffer;
}

// Helper to fetch and decode
async function loadBuffer(urlOrBlob) {
    if (!audioCtx) init();
    resumeContext();

    try {
        let arrayBuffer;
        if (typeof urlOrBlob === 'string') {
            const res = await fetch(urlOrBlob);
            arrayBuffer = await res.arrayBuffer();
        } else if (urlOrBlob instanceof Blob) {
            arrayBuffer = await urlOrBlob.arrayBuffer();
        } else {
            throw new Error("Invalid audio source");
        }

        const decoded = await audioCtx.decodeAudioData(arrayBuffer);
        return decoded;
    } catch (e) {
        if (callbacks.onError) callbacks.onError(e);
        console.error("Audio Load Error:", e);
        return null;
    }
}

function stopSource() {
    if (sourceNode) {
        try {
            sourceNode.stop();
            sourceNode.disconnect();
        } catch (e) {}
        sourceNode = null;
    }
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    isPlayingFlag = false;
}

function playBuffer(buffer, offset) {
    stopSource();
    audioBuffer = buffer;
    
    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(gainNode);
    
    // Handle looping or end
    sourceNode.onended = () => {
        // Only trigger onEnd if we reached the end naturally, not if we stopped it manually
        // Check if expected end time has passed
        const expectedDuration = buffer.duration - offset;
        const elapsed = audioCtx.currentTime - startTime;
        
        if (isPlayingFlag && elapsed >= expectedDuration - 0.1) {
            isPlayingFlag = false;
            cancelAnimationFrame(animationFrameId);
            pauseOffset = 0; // Reset
            if (callbacks.onEnd) callbacks.onEnd();
        }
    };

    sourceNode.start(0, offset);
    startTime = audioCtx.currentTime;
    pauseOffset = offset;
    isPlayingFlag = true;

    updateLoop();
}

function updateLoop() {
    if (!isPlayingFlag) return;
    
    // Calculate current time
    const elapsed = audioCtx.currentTime - startTime;
    const current = pauseOffset + elapsed;
    
    if (callbacks.onUpdate && audioBuffer) {
        callbacks.onUpdate(current, audioBuffer.duration);
    }
    
    animationFrameId = requestAnimationFrame(updateLoop);
}

export async function playUrl(url) {
    // Reset state
    stopSource();
    pauseOffset = 0;
    if(callbacks.onUpdate) callbacks.onUpdate(0, 0);
    
    const buffer = await loadBuffer(url);
    if (buffer) {
        playBuffer(buffer, 0);
    }
}

export async function playBlob(blob) {
    stopSource();
    pauseOffset = 0;
    const buffer = await loadBuffer(blob);
    if (buffer) {
        playBuffer(buffer, 0);
    }
}

export function togglePlay() {
    if (!audioBuffer) return;
    
    if (isPlayingFlag) {
        // Pause
        const elapsed = audioCtx.currentTime - startTime;
        pauseOffset += elapsed;
        stopSource(); 
        // Update UI one last time
        if (callbacks.onUpdate) callbacks.onUpdate(pauseOffset, audioBuffer.duration);
    } else {
        // Resume
        if(audioCtx.state === 'suspended') audioCtx.resume();
        playBuffer(audioBuffer, pauseOffset);
    }
}

export function seek(time) { // Time in seconds
    if (!audioBuffer) return;
    const duration = audioBuffer.duration;
    time = Math.max(0, Math.min(time, duration));
    
    pauseOffset = time;
    
    if (isPlayingFlag) {
        playBuffer(audioBuffer, pauseOffset);
    } else {
        if (callbacks.onUpdate) callbacks.onUpdate(pauseOffset, duration);
    }
}

export function isPlaying() {
    return isPlayingFlag;
}

export function getFreqData() {
    const data = new Uint8Array(analyser ? analyser.frequencyBinCount : 0);
    if(analyser) analyser.getByteFrequencyData(data);
    return data;
}

// Proxy object to mimic HTMLAudioElement interface for other modules
export const audioEl = {
    get currentTime() { 
        if(!audioCtx) return 0;
        if(isPlayingFlag) return pauseOffset + (audioCtx.currentTime - startTime);
        return pauseOffset; 
    },
    get duration() { return audioBuffer ? audioBuffer.duration : 0; },
    get paused() { return !isPlayingFlag; }
};