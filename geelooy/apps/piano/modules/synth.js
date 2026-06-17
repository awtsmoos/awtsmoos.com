/* B"H
The synth is no longer a flat wire; it is a living chamber of velocity, FM glass, tine sparks, stereo breath, warmth, and rivers.
*/
import { AudioState } from './audio.js';
import { elements } from './ui.js';
import { customWaves } from './waveforms.js';
import { readPresetFromElements } from './sound/presets.js';
import { createVelocity, humanize } from './sound/velocity.js';
import { createTransient, startTransient } from './sound/transients.js';
import { setChorusAmount } from './sound/chorus.js';
import { setDelay } from './effects/delay.js';
import { createSaturator } from './sound/saturation.js';
import { createSampleVoice } from './sound/sampleEngine.js';
import { createFmPair, startFm, stopFm } from './sound/fmEngine.js';
import { pedalState } from './performance/pedal.js';
import { createSympatheticResonance, rememberStrike, repetitionFactor } from './performance/resonance.js';

const BASE_GAIN_OSC = 0.42;
const CHORD_GAIN_MULTIPLIER = 0.34;

export const activeNotes = new Map();
export let currentChordNodes = [];
export let currentChordRoot = null;
export let noteHistory = [];

export function getADSR() {
    return {
        attack: parseFloat(elements.attackSlider.value),
        decay: parseFloat(elements.decaySlider.value),
        sustain: parseFloat(elements.sustainSlider.value)
    };
}

export function createSynthNode(isChord = false, isBass = false, options = {}) {
    const ctx = AudioState.context;
    const preset = readPresetFromElements(elements);
    const velocity = createVelocity(options.inputId, options.coords);
    const h = humanize(preset, velocity);
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const amp = ctx.createGain();
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const saturator = createSaturator(ctx, preset.saturationDrive);
    osc1.connect(gain1); osc2.connect(gain2);
    gain1.connect(amp); gain2.connect(amp);
    amp.connect(pan); pan.connect(filter); filter.connect(saturator);
    saturator.connect(AudioState.masterGain);
    if (AudioState.chorus) saturator.connect(AudioState.chorus.input);
    if (AudioState.delayRack) saturator.connect(AudioState.delayRack.input);
    saturator.connect(AudioState.convolver);
    const nodes = { osc1, osc2, gain1, gain2, noteGain: amp, pan, filter, saturator, preset, velocity, human: h, isChord, isBass };
    applyCurrentParameters(nodes, isChord, isBass);
    return nodes;
}

export function applyCurrentParameters(nodes, isChord, isBass = false) {
    const ctx = AudioState.context;
    const preset = readPresetFromElements(elements);
    const wave1 = isBass ? (elements.bassWaveformSelect?.value || 'triangle') : (isChord ? preset.chordWave : preset.wave1);
    applyWave(nodes.osc1, wave1);
    applyWave(nodes.osc2, preset.wave2);
    nodes.gain1.gain.value = 1 - preset.oscMix;
    nodes.gain2.gain.value = preset.oscMix;
    nodes.filter.type = 'lowpass';
    nodes.filter.frequency.setValueAtTime(preset.filterCutoff * nodes.human.brightness, ctx.currentTime);
    nodes.filter.Q.setValueAtTime(preset.filterQ, ctx.currentTime);
    if (nodes.pan.pan) nodes.pan.pan.setValueAtTime(nodes.human.pan, ctx.currentTime);
    if (AudioState.lfo?.gain) safeConnect(AudioState.lfo.gain, nodes.filter.frequency);
    scheduleGain(nodes, preset, isChord, isBass);
    AudioState.wetGain.gain.setTargetAtTime(preset.reverbSend, ctx.currentTime, 0.03);
    setChorusAmount(AudioState.chorus, preset.chorusSend, ctx.currentTime);
    setDelay(AudioState.delayRack, preset.delaySend || 0, ctx.currentTime, preset.delayTime, preset.delayFeedback);
}

function scheduleGain(nodes, preset, isChord, isBass) {
    const ctx = AudioState.context;
    const adsr = getADSR();
    let peak = BASE_GAIN_OSC * nodes.velocity * repetitionFactor(nodes.noteName || '', ctx.currentTime) * (1 + preset.oscMix);
    if (isChord) peak *= CHORD_GAIN_MULTIPLIER;
    if (isBass) peak *= 0.78;
    nodes.noteGain.gain.cancelScheduledValues(ctx.currentTime);
    nodes.noteGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    const attack = isBass ? 0.01 : adsr.attack;
    nodes.noteGain.gain.linearRampToValueAtTime(peak, ctx.currentTime + attack);
    nodes.noteGain.gain.setTargetAtTime(peak * adsr.sustain, ctx.currentTime + attack, adsr.decay + 0.001);
}

export function startSynth(nodes, frequency, noteName = '') {
    const ctx = AudioState.context;
    nodes.noteName = noteName;
    const p = nodes.preset;
    nodes.osc1.frequency.setValueAtTime(frequency, ctx.currentTime);
    nodes.osc2.frequency.setValueAtTime(frequency, ctx.currentTime);
    nodes.osc1.detune.setValueAtTime(parseFloat(elements.pitchDepthSlider.value) + nodes.human.drift, ctx.currentTime);
    nodes.osc2.detune.setValueAtTime(p.detuneCents + nodes.human.drift, ctx.currentTime);
    nodes.fm = createFmPair(ctx, nodes.osc1, frequency, p, nodes.velocity);
    nodes.transient = createTransient(ctx, nodes.filter, frequency, nodes.velocity, p);
    nodes.sampleVoice = createSampleVoice(ctx, nodes.filter, p, noteName);
    nodes.sympathetic = createSympatheticResonance(ctx, nodes.filter, frequency, pedalState.sustain, nodes.velocity);
    rememberStrike(noteName, ctx.currentTime, nodes.velocity);
    nodes.osc1.start(ctx.currentTime); nodes.osc2.start(ctx.currentTime);
    startFm(nodes.fm, ctx.currentTime); startTransient(nodes.transient, ctx.currentTime);
    if (nodes.sampleVoice) nodes.sampleVoice.source.start(ctx.currentTime);
    if (nodes.sympathetic) nodes.sympathetic.osc.start(ctx.currentTime);
}

export function stopSynth(nodes) {
    if (!nodes) return;
    const ctx = AudioState.context;
    const release = parseFloat(elements.releaseSlider.value);
    nodes.noteGain.gain.cancelScheduledValues(ctx.currentTime);
    nodes.noteGain.gain.setValueAtTime(Math.max(0.0001, nodes.noteGain.gain.value), ctx.currentTime);
    nodes.noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + release);
    const stopTime = ctx.currentTime + release + 0.1;
    stopFm(nodes.fm, stopTime);
    stopNode(nodes.osc1, stopTime); stopNode(nodes.osc2, stopTime);
    if (nodes.sampleVoice) stopNode(nodes.sampleVoice.source, stopTime);
    if (nodes.sympathetic) stopNode(nodes.sympathetic.osc, stopTime);
    nodes.osc1.onended = () => cleanup(nodes);
}

export function updateAllActiveNotesParameters() {
    [...activeNotes.values()].map(n => n.synthNodes).concat(currentChordNodes).forEach(nodes => {
        if (nodes) applyCurrentParameters(nodes, currentChordNodes.includes(nodes), nodes.isBass);
    });
}

function applyWave(osc, wave) { customWaves[wave] ? osc.setPeriodicWave(customWaves[wave]) : osc.type = wave; }
function safeConnect(a, b) { try { a.connect(b); } catch (_) {} }
function stopNode(node, time) { try { node.stop(time); } catch (_) {} }
function cleanup(nodes) { try { AudioState.lfo?.gain?.disconnect(nodes.filter.frequency); } catch (_) {} }
export function setCurrentChordNodes(nodes) { currentChordNodes = nodes; }
export function setCurrentChordRoot(root) { currentChordRoot = root; }
export function clearCurrentChord() { currentChordNodes.forEach(n => stopSynth(n)); currentChordNodes = []; currentChordRoot = null; }
