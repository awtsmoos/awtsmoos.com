/* B"H
A note is a palace: two bodies, a warm gate, a restrained spark, and only enough heaven to shine.
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

const BASE_GAIN_OSC = 0.34;
const CHORD_GAIN_MULTIPLIER = 0.3;
export const activeNotes = new Map();
export let currentChordNodes = [];
export let currentChordRoot = null;
export let noteHistory = [];

export function getADSR() {
    return { attack: val(elements.attackSlider, .02), decay: val(elements.decaySlider, .4), sustain: val(elements.sustainSlider, .6) };
}

export function createSynthNode(isChord = false, isBass = false, options = {}) {
    const ctx = AudioState.context, preset = readPresetFromElements(elements);
    const velocity = createVelocity(options.inputId, options.coords), human = humanize(preset, velocity);
    const osc1 = ctx.createOscillator(), osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain(), gain2 = ctx.createGain(), body = ctx.createGain(), amp = ctx.createGain();
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    const filter = ctx.createBiquadFilter(), toneTrim = ctx.createBiquadFilter(), saturator = createSaturator(ctx, preset.saturationDrive);
    osc1.connect(gain1); osc2.connect(gain2); gain1.connect(body); gain2.connect(body);
    body.connect(amp); amp.connect(pan); pan.connect(filter); filter.connect(toneTrim); toneTrim.connect(saturator);
    saturator.connect(AudioState.masterGain); saturator.connect(AudioState.convolver);
    if (AudioState.chorus) saturator.connect(AudioState.chorus.input);
    if (AudioState.delayRack) saturator.connect(AudioState.delayRack.input);
    const nodes = { osc1, osc2, gain1, gain2, body, noteGain: amp, pan, filter, toneTrim, saturator, preset, velocity, human, isChord, isBass, lfoConnected: false };
    applyCurrentParameters(nodes, isChord, isBass);
    return nodes;
}

export function applyCurrentParameters(nodes, isChord, isBass = false) {
    const ctx = AudioState.context, preset = readPresetFromElements(elements), now = ctx.currentTime;
    const wave1 = isBass ? (elements.bassWaveformSelect?.value || preset.bassWave || 'triangle') : (isChord ? preset.chordWave : preset.wave1);
    applyWave(nodes.osc1, wave1); applyWave(nodes.osc2, preset.wave2);
    nodes.gain1.gain.setTargetAtTime(1 - preset.oscMix, now, .015);
    nodes.gain2.gain.setTargetAtTime(preset.oscMix, now, .015);
    nodes.body.gain.setTargetAtTime(isBass ? .82 : .92, now, .02);
    nodes.filter.type = 'lowpass'; nodes.toneTrim.type = 'highshelf';
    nodes.filter.frequency.setTargetAtTime(clamp(preset.filterCutoff * nodes.human.brightness, 180, 15500), now, .018);
    nodes.filter.Q.setTargetAtTime(clamp(preset.filterQ, .1, 18), now, .018);
    nodes.toneTrim.frequency.setTargetAtTime(6800, now, .02);
    nodes.toneTrim.gain.setTargetAtTime(preset.filterQ > 10 ? -2.5 : -.7, now, .02);
    if (nodes.pan.pan) nodes.pan.pan.setTargetAtTime(nodes.human.pan, now, .02);
    connectLfo(nodes);
    scheduleGain(nodes, preset, isChord, isBass);
    AudioState.wetGain.gain.setTargetAtTime(preset.reverbSend, now, .04);
    setChorusAmount(AudioState.chorus, preset.chorusSend, now);
    setDelay(AudioState.delayRack, preset.delaySend || 0, now, preset.delayTime, preset.delayFeedback);
}

function scheduleGain(nodes, preset, isChord, isBass) {
    const ctx = AudioState.context, adsr = getADSR(), now = ctx.currentTime;
    let peak = BASE_GAIN_OSC * nodes.velocity * repetitionFactor(nodes.noteName || '', now) * (1 + preset.oscMix * .45);
    if (isChord) peak *= CHORD_GAIN_MULTIPLIER;
    if (isBass) peak *= .75;
    nodes.noteGain.gain.cancelScheduledValues(now);
    nodes.noteGain.gain.setValueAtTime(Math.max(.0001, nodes.noteGain.gain.value || .0001), now);
    nodes.noteGain.gain.linearRampToValueAtTime(peak, now + (isBass ? .008 : adsr.attack));
    nodes.noteGain.gain.setTargetAtTime(peak * adsr.sustain, now + adsr.attack, adsr.decay + .001);
}

export function startSynth(nodes, frequency, noteName = '') {
    const ctx = AudioState.context, now = ctx.currentTime, p = nodes.preset;
    nodes.noteName = noteName;
    nodes.osc1.frequency.setValueAtTime(frequency, now); nodes.osc2.frequency.setValueAtTime(frequency, now);
    nodes.osc1.detune.setValueAtTime(val(elements.pitchDepthSlider, 0) * .35 + nodes.human.drift, now);
    nodes.osc2.detune.setValueAtTime(p.detuneCents + nodes.human.drift, now);
    nodes.fm = createFmPair(ctx, nodes.osc1, frequency, p, nodes.velocity);
    nodes.transient = createTransient(ctx, nodes.filter, frequency, nodes.velocity, p);
    nodes.sampleVoice = createSampleVoice(ctx, nodes.filter, p, noteName);
    nodes.sympathetic = createSympatheticResonance(ctx, nodes.filter, frequency, pedalState.sustain, nodes.velocity);
    rememberStrike(noteName, now, nodes.velocity);
    nodes.osc1.start(now); nodes.osc2.start(now); startFm(nodes.fm, now); startTransient(nodes.transient, now);
    if (nodes.sampleVoice) nodes.sampleVoice.source.start(now);
    if (nodes.sympathetic) nodes.sympathetic.osc.start(now);
}

export function stopSynth(nodes) {
    if (!nodes) return;
    const ctx = AudioState.context, now = ctx.currentTime, release = val(elements.releaseSlider, .8);
    nodes.noteGain.gain.cancelScheduledValues(now);
    nodes.noteGain.gain.setValueAtTime(Math.max(.0001, nodes.noteGain.gain.value), now);
    nodes.noteGain.gain.exponentialRampToValueAtTime(.0001, now + release);
    const stopTime = now + release + .12;
    stopFm(nodes.fm, stopTime); [nodes.osc1, nodes.osc2, nodes.sampleVoice?.source, nodes.sympathetic?.osc].forEach(n => stopNode(n, stopTime));
    nodes.osc1.onended = () => cleanup(nodes);
}

export function updateAllActiveNotesParameters() {
    [...activeNotes.values()].map(n => n.synthNodes).concat(currentChordNodes).forEach(nodes => nodes && applyCurrentParameters(nodes, currentChordNodes.includes(nodes), nodes.isBass));
}
function applyWave(osc, wave) { customWaves[wave] ? osc.setPeriodicWave(customWaves[wave]) : osc.type = wave; }
function connectLfo(nodes) { if (!nodes.lfoConnected && AudioState.lfo?.gain) { try { AudioState.lfo.gain.connect(nodes.filter.frequency); nodes.lfoConnected = true; } catch (_) {} } }
function cleanup(nodes) { if (nodes.lfoConnected) try { AudioState.lfo?.gain?.disconnect(nodes.filter.frequency); } catch (_) {} }
function stopNode(node, time) { try { node?.stop(time); } catch (_) {} }
function val(el, fallback) { return parseFloat(el?.value ?? fallback); }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
export function setCurrentChordNodes(nodes) { currentChordNodes = nodes; }
export function setCurrentChordRoot(root) { currentChordRoot = root; }
export function clearCurrentChord() { currentChordNodes.forEach(n => stopSynth(n)); currentChordNodes = []; currentChordRoot = null; }
