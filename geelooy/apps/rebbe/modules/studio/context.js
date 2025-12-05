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