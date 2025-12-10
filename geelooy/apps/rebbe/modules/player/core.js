//B"H
// modules/player/core.js

export const pState = {
    ctx: null,
    source: null,
    analyser: null,
    gain: null,
    buffer: null,
    
    startTime: 0,
    pauseOffset: 0,
    isPlaying: false,
    
    callbacks: {
        onUpdate: null,
        onEnd: null,
        onError: null
    },
    
    animationFrameId: null
};

export function init() {
    if (pState.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    pState.ctx = new AudioContext();
    pState.analyser = pState.ctx.createAnalyser();
    pState.analyser.fftSize = 256;
    pState.gain = pState.ctx.createGain();
    pState.gain.connect(pState.analyser);
    pState.analyser.connect(pState.ctx.destination);
    
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