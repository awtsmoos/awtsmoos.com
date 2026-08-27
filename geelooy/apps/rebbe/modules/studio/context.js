//B"H
// modules/studio/context.js

export const ctx = {
    canvas: null,
    g: null,
    audio: null,
    analyser: null,
    source: null,
    requestID: null,
    mediaCache: {},
    spectrum: new Uint8Array(256),
    waveform: new Uint8Array(256),
    analysisData: [], // Stores frame-by-frame energy for scrubbing
    activeSources: [], // Track playing sources
    bass: 0,
    mid: 0,
    treble: 0
};

export function initAudioContext() {
    if (!ctx.audio) {
        ctx.audio = new (window.AudioContext || window.webkitAudioContext)();
        ctx.analyser = ctx.audio.createAnalyser();
        ctx.analyser.fftSize = 512;
    }
}

export function clearMediaCache() {
    // Release object URLs if any (though we usually use src strings)
    // Clear references to images/videos to allow GC
    Object.keys(ctx.mediaCache).forEach(k => {
        const item = ctx.mediaCache[k];
        if(item.type === 'video' && item.el) {
            item.el.pause();
            item.el.src = "";
            item.el.load();
        }
        item.el = null;
    });
    ctx.mediaCache = {};
    ctx.analysisData = []; // Clear large analysis arrays
}