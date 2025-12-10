
/* B"H */
// piano/modules/synth.js
import { AudioState } from './audio.js';
import { elements } from './ui.js';
import { customWaves } from './waveforms.js';

const BASE_GAIN_OSC = 0.45;
const CHORD_GAIN_MULTIPLIER = 0.35;

export const activeNotes = new Map();
// Exported so accompaniment can track what user is playing
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

export function createSynthNode(isChord = false, isBass = false) {
    const ctx = AudioState.context;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const noteGain = ctx.createGain();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(noteGain);
    gain2.connect(noteGain);
    noteGain.connect(filter);

    filter.connect(AudioState.masterGain);
    filter.connect(AudioState.convolver);

    const nodes = { osc1, osc2, gain1, gain2, filter, noteGain };
    applyCurrentParameters(nodes, isChord, isBass);
    return nodes;
}

export function applyCurrentParameters(nodes, isChord, isBass = false) {
    const { osc1, osc2, gain1, gain2, filter, noteGain } = nodes;
    const ct = AudioState.context.currentTime;

    let wave1;
    if (isBass) {
        wave1 = elements.bassWaveformSelect ? elements.bassWaveformSelect.value : 'triangle';
    } else {
        wave1 = isChord ? elements.chordWaveformSelect.value : elements.waveformSelect.value;
    }
    const wave2 = elements.waveform2Select.value;

    if (customWaves[wave1]) osc1.setPeriodicWave(customWaves[wave1]);
    else osc1.type = wave1;

    if (customWaves[wave2]) osc2.setPeriodicWave(customWaves[wave2]);
    else osc2.type = wave2;

    gain1.gain.value = 1 - parseFloat(elements.oscMixSlider.value);
    gain2.gain.value = parseFloat(elements.oscMixSlider.value);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(parseFloat(elements.filterCutoffSlider.value), ct);
    filter.Q.setValueAtTime(parseFloat(elements.filterQSlider.value), ct);
    
    if (AudioState.lfo && AudioState.lfo.gain) {
        AudioState.lfo.gain.connect(filter.frequency);
    }

    const baseADSR = getADSR();
    // Bass notes might want punchier ADSR, but we'll use global for simplicity unless overridden
    let peakGain = BASE_GAIN_OSC * (1 + parseFloat(elements.oscMixSlider.value));
    if (isChord) peakGain *= CHORD_GAIN_MULTIPLIER;
    if (isBass) peakGain *= 0.8; // Bass slightly quieter to not mud mix

    noteGain.gain.cancelScheduledValues(ct);
    noteGain.gain.setValueAtTime(0.0001, ct);
    
    const attack = isBass ? 0.01 : baseADSR.attack; // Snappy bass
    noteGain.gain.linearRampToValueAtTime(peakGain, ct + attack);
    noteGain.gain.setTargetAtTime(peakGain * baseADSR.sustain, ct + attack, baseADSR.decay + 0.001);

    AudioState.wetGain.gain.setTargetAtTime(parseFloat(elements.reverbSlider.value), ct, 0.01);
}

export function startSynth(nodes, frequency) {
    const ct = AudioState.context.currentTime;
    const pitchDepth = parseFloat(elements.pitchDepthSlider.value);
    const pitchAttack = parseFloat(elements.pitchAttackSlider.value);

    nodes.osc1.frequency.setValueAtTime(frequency, ct);
    nodes.osc2.frequency.setValueAtTime(frequency, ct);

    nodes.osc1.detune.setValueAtTime(pitchDepth, ct);
    nodes.osc1.detune.exponentialRampToValueAtTime(0.01, ct + pitchAttack);

    const osc2DetuneValue = parseFloat(elements.detuneSlider.value);
    nodes.osc2.detune.setValueAtTime(osc2DetuneValue + pitchDepth, ct);
    nodes.osc2.detune.exponentialRampToValueAtTime(osc2DetuneValue + 0.01, ct + pitchAttack);

    nodes.osc1.start(ct);
    nodes.osc2.start(ct);
}

export function stopSynth(nodes) {
    if (!nodes) return;
    const { osc1, osc2, noteGain, filter } = nodes;
    const releaseTime = parseFloat(elements.releaseSlider.value);
    const ct = AudioState.context.currentTime;

    noteGain.gain.cancelScheduledValues(ct);
    noteGain.gain.setValueAtTime(noteGain.gain.value, ct);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, ct + releaseTime);

    const stopTime = ct + releaseTime + 0.1;
    osc1.stop(stopTime);
    osc2.stop(stopTime);

    osc1.onended = () => {
        if (filter && filter.frequency && AudioState.lfo) {
            try { AudioState.lfo.gain.disconnect(filter.frequency); } catch(e){}
        }
    };
}

export function updateAllActiveNotesParameters() {
    const allNodes = [...activeNotes.values()].map(n => n.synthNodes).concat(currentChordNodes);
    const ct = AudioState.context.currentTime;
    const rampTime = ct + 0.05;

    allNodes.forEach(nodes => {
        if (!nodes) return;
        const isChord = currentChordNodes.includes(nodes); 
        const wave1 = isChord ? elements.chordWaveformSelect.value : elements.waveformSelect.value;
        const wave2 = elements.waveform2Select.value;

        if (customWaves[wave1]) nodes.osc1.setPeriodicWave(customWaves[wave1]);
        else nodes.osc1.type = wave1;
        if (customWaves[wave2]) nodes.osc2.setPeriodicWave(customWaves[wave2]);
        else nodes.osc2.type = wave2;

        nodes.osc2.detune.linearRampToValueAtTime(parseFloat(elements.detuneSlider.value), rampTime);
        nodes.gain1.gain.linearRampToValueAtTime(1 - parseFloat(elements.oscMixSlider.value), rampTime);
        nodes.gain2.gain.linearRampToValueAtTime(parseFloat(elements.oscMixSlider.value), rampTime);
        nodes.filter.frequency.linearRampToValueAtTime(parseFloat(elements.filterCutoffSlider.value), rampTime);
        nodes.filter.Q.linearRampToValueAtTime(parseFloat(elements.filterQSlider.value), rampTime);
        AudioState.wetGain.gain.linearRampToValueAtTime(parseFloat(elements.reverbSlider.value), rampTime);
    });
}

// Helpers for Chords
export function setCurrentChordNodes(nodes) { currentChordNodes = nodes; }
export function setCurrentChordRoot(root) { currentChordRoot = root; }
export function clearCurrentChord() {
    currentChordNodes.forEach(n => stopSynth(n));
    currentChordNodes = [];
    currentChordRoot = null;
}
