//B"H
// modules/player/core.js

export const pState = {
    ctx: null,
    source: null,
    audioElement: null,
    analyser: null,
    gain: null,
    
    // Legacy support for visualizer buffer access if needed, 
    // though streaming won't populate this.
    buffer: null, 
    
    isPlaying: false,
    
    callbacks: {
        onUpdate: null,
        onEnd: null,
        onError: null,
        onPlay: null,
        onPause: null
    }
};

export function init() {
    if (pState.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    pState.ctx = new AudioContext();
    
    // Create HTML5 Audio Element for Streaming
    pState.audioElement = new Audio();
    pState.audioElement.crossOrigin = "anonymous";
    
    // Connect to Web Audio Graph for Visualization
    pState.source = pState.ctx.createMediaElementSource(pState.audioElement);
    pState.analyser = pState.ctx.createAnalyser();
    pState.analyser.fftSize = 256;
    pState.gain = pState.ctx.createGain();
    
    pState.source.connect(pState.gain);
    pState.gain.connect(pState.analyser);
    pState.analyser.connect(pState.ctx.destination);
    
    // Bind Element Events to Callbacks
    pState.audioElement.addEventListener('timeupdate', () => {
        if (pState.callbacks.onUpdate) {
            const cur = pState.audioElement.currentTime;
            const dur = pState.audioElement.duration || 0;
            pState.callbacks.onUpdate(cur, dur);
        }
    });

    pState.audioElement.addEventListener('ended', () => {
        pState.isPlaying = false;
        if (pState.callbacks.onEnd) pState.callbacks.onEnd();
    });

    pState.audioElement.addEventListener('error', (e) => {
        console.error("Audio Element Error:", e);
        if (pState.callbacks.onError) pState.callbacks.onError(e);
    });

    pState.audioElement.addEventListener('play', () => { pState.isPlaying = true; });
    pState.audioElement.addEventListener('pause', () => { pState.isPlaying = false; });
    
    // Unlock AudioContext on interaction
    const resume = () => { 
        if(pState.ctx.state === 'suspended') pState.ctx.resume(); 
    };
    document.addEventListener('click', resume, { once: true });
    document.addEventListener('touchstart', resume, { once: true });
}

export function resumeContext() {
    if (pState.ctx && pState.ctx.state === 'suspended') {
        pState.ctx.resume();
    }
}

export function setBuffer(b) { pState.buffer = b; }
export function getBuffer() { return pState.buffer; }

// Deprecated for playback, kept if app needs manual buffer loading
export async function loadBuffer(urlOrBlob) {
    if (!pState.ctx) init();
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

        return await pState.ctx.decodeAudioData(arrayBuffer);
    } catch (e) {
        if (pState.callbacks.onError) pState.callbacks.onError(e);
        console.error("Audio Load Error:", e);
        return null;
    }
}