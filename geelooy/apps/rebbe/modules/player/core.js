//B"H
// modules/player/core.js

export const pState = {
    ctx: null,
    source: null,
    audioElement: null,
    analyser: null,
    gain: null,
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
    if (pState.audioElement) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    try {
        pState.ctx = AudioContext ? new AudioContext() : null;
    } catch (e) {
        console.warn('AudioContext not available, using plain audio element.', e);
        pState.ctx = null;
    }

    pState.audioElement = new Audio();

    // CRITICAL: no crossOrigin here. Archive/302/media-nodes often lack CORS headers
    // but still play in a normal <audio>. Never force CORS for the player.
    pState.audioElement.removeAttribute('crossorigin');
    pState.audioElement.preload = 'metadata';

    bindEvents();
    unlockOnInteraction();
}

function bindEvents() {
    const audio = pState.audioElement;

    audio.addEventListener('timeupdate', () => {
        if (pState.callbacks.onUpdate) {
            pState.callbacks.onUpdate(audio.currentTime, audio.duration || 0);
        }
    });

    audio.addEventListener('ended', () => {
        pState.isPlaying = false;
        if (pState.callbacks.onEnd) pState.callbacks.onEnd();
    });

    audio.addEventListener('error', e => {
        const err = audio.error;
        console.error('Audio Element Error:', err || e);
        if (pState.callbacks.onError) pState.callbacks.onError(err || e);
    });

    audio.addEventListener('play', () => {
        pState.isPlaying = true;
        if (pState.callbacks.onPlay) pState.callbacks.onPlay();
    });

    audio.addEventListener('pause', () => {
        pState.isPlaying = false;
        if (pState.callbacks.onPause) pState.callbacks.onPause();
    });
}

function unlockOnInteraction() {
    const resume = () => resumeContext();
    document.addEventListener('click', resume, { once: true });
    document.addEventListener('touchstart', resume, { once: true });
}

// Optional. Do not call this for Archive playback unless you truly need analyser data.
// Plain <audio> playback is intentionally kept independent of WebAudio/CORS.
export function enableAnalyzerIfSafe() {
    if (!pState.ctx || !pState.audioElement || pState.source) return false;

    try {
        pState.source = pState.ctx.createMediaElementSource(pState.audioElement);
        pState.analyser = pState.ctx.createAnalyser();
        pState.analyser.fftSize = 256;
        pState.gain = pState.ctx.createGain();

        pState.source.connect(pState.gain);
        pState.gain.connect(pState.analyser);
        pState.analyser.connect(pState.ctx.destination);
        return true;
    } catch (e) {
        console.warn('Audio analyser disabled for this source', e);
        pState.source = null;
        pState.analyser = null;
        pState.gain = null;
        return false;
    }
}

export function resumeContext() {
    if (pState.ctx && pState.ctx.state === 'suspended') {
        pState.ctx.resume().catch(() => {});
    }
}

export function setBuffer(b) {
    pState.buffer = b;
}

export function getBuffer() {
    return pState.buffer;
}

export async function loadBuffer(urlOrBlob) {
    if (!pState.ctx) init();
    resumeContext();

    if (!pState.ctx) return null;

    try {
        let arrayBuffer;
        if (typeof urlOrBlob === 'string') {
            const res = await fetch(urlOrBlob);
            if (!res.ok) throw new Error(`Audio fetch failed: ${res.status}`);
            arrayBuffer = await res.arrayBuffer();
        } else if (urlOrBlob instanceof Blob) {
            arrayBuffer = await urlOrBlob.arrayBuffer();
        } else {
            throw new Error('Invalid audio source');
        }

        return await pState.ctx.decodeAudioData(arrayBuffer.slice(0));
    } catch (e) {
        if (pState.callbacks.onError) pState.callbacks.onError(e);
        console.error('Audio Load Error:', e);
        return null;
    }
}
