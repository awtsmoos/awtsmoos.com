/* B"H
The master chain is the golden gate: dry keys, wet heavens, chorus rivers, and a compressor crown.
*/
import { createChorus } from './sound/chorus.js';
import { createDelayRack } from './effects/delay.js';

export const AudioState = {
    context: null,
    masterGain: null,
    compressor: null,
    mediaStreamDestination: null,
    convolver: null,
    wetGain: null,
    lfo: null,
    chorus: null,
    delayRack: null,
    microphoneSource: null,
    microphoneGain: null,
    micPlaybackGain: null,
    hiddenAudioProxy: null
};

export function initAudio() {
    try {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        AudioState.context = new Ctor({ latencyHint: 'interactive', sampleRate: 44100 });
        AudioState.mediaStreamDestination = AudioState.context.createMediaStreamDestination();
        setupHiddenProxy();
        setupMasterChain();
        setupReverb();
        setupLFO();
        AudioState.chorus = createChorus(AudioState.context, AudioState.masterGain);
        AudioState.delayRack = createDelayRack(AudioState.context, AudioState.masterGain);
        if (AudioState.context.state === 'suspended') AudioState.context.resume();
        return true;
    } catch (e) {
        console.error('Audio init failed', e);
        return false;
    }
}

function setupHiddenProxy() {
    AudioState.hiddenAudioProxy = document.createElement('audio');
    AudioState.hiddenAudioProxy.setAttribute('playsinline', 'true');
    AudioState.hiddenAudioProxy.setAttribute('loop', 'true');
    AudioState.hiddenAudioProxy.style.display = 'none';
    document.body.appendChild(AudioState.hiddenAudioProxy);
}

function setupMasterChain() {
    const ctx = AudioState.context;
    AudioState.masterGain = ctx.createGain();
    AudioState.compressor = ctx.createDynamicsCompressor();
    AudioState.masterGain.gain.value = 0.9;
    AudioState.compressor.threshold.value = -18;
    AudioState.compressor.knee.value = 22;
    AudioState.compressor.ratio.value = 7;
    AudioState.compressor.attack.value = 0.004;
    AudioState.compressor.release.value = 0.22;
    AudioState.masterGain.connect(AudioState.compressor);
    AudioState.compressor.connect(ctx.destination);
    AudioState.compressor.connect(AudioState.mediaStreamDestination);
}

function setupReverb() {
    const ctx = AudioState.context;
    AudioState.convolver = ctx.createConvolver();
    AudioState.wetGain = ctx.createGain();
    AudioState.wetGain.gain.value = 0;
    AudioState.convolver.connect(AudioState.wetGain);
    AudioState.wetGain.connect(AudioState.masterGain);
    AudioState.convolver.buffer = createImpulse(ctx, 2.4, 2.9);
}

function createImpulse(ctx, seconds, decay) {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
        const data = buffer.getChannelData(c);
        for (let i = 0; i < length; i++) {
            const tail = Math.pow(1 - i / length, decay);
            data[i] = (Math.random() * 2 - 1) * tail * (c ? 0.94 : 1);
        }
    }
    return buffer;
}

function setupLFO() {
    const ctx = AudioState.context;
    AudioState.lfo = { osc: ctx.createOscillator(), gain: ctx.createGain() };
    AudioState.lfo.osc.type = 'sine';
    AudioState.lfo.gain.gain.value = 0;
    AudioState.lfo.osc.connect(AudioState.lfo.gain);
    AudioState.lfo.osc.start();
}
