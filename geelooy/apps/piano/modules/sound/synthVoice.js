//B"H
//Boruch Hashem
//Blessed is He
/**
 * One note receives its graph, character, envelope, and release from the Awtsmoos in ordered time.
 * Awtsmoos.com keeps the voice engine focused so its public coordinator can stay a narrow rhyme.
 */

import { AudioState } from '../audio.js';
import { elements } from '../ui.js';
import { readPresetFromElements } from './presets.js';
import { startVoiceCharacter } from './voiceCharacter.js';
import { createVoiceGraph } from './voiceGraph.js';
import { disposeVoiceGraph, scheduleVoiceStop } from './voiceLifecycle.js';
import { applyVoiceParameters } from './voiceParameters.js';
import { startVoicePerformance } from './voicePerformance.js';
import { createVelocity, humanize } from './velocity.js';

/** Reads the visible ADSR controls for compatibility with the performance envelope. */
export function getADSR() {
	return {
		attack: numberFrom(elements.attackSlider, 0.006),
		decay: numberFrom(elements.decaySlider, 0.18),
		sustain: numberFrom(elements.sustainSlider, 0.68),
		release: numberFrom(elements.releaseSlider, 0.34)
	};
}

/** Creates one connected but silent synth voice using the current preset and performance input. */
export function createSynthNode(isChord = false, isBass = false, options = {}) {
	const context = AudioState.context;
	if (!context || !AudioState.masterGain) {
		return null;
	}
	const preset = readPresetFromElements(elements);
	const velocity = createVelocity(options.inputId, options.coords);
	const human = humanize(preset, velocity);
	const graph = createVoiceGraph(context, preset);
	const nodes = {
		...graph,
		preset,
		velocity,
		human,
		isChord,
		isBass,
		noise: null,
		character: null,
		stopped: false,
		disposed: false,
		disposeTimer: null
	};
	applyVoiceParameters(nodes, preset, human, isChord, isBass, context.currentTime);
	return nodes;
}

/** Applies current controls to an already sounding voice without rebuilding its graph. */
export function applyCurrentParameters(nodes, isChord = nodes?.isChord, isBass = nodes?.isBass) {
	if (!nodes || nodes.disposed || !AudioState.context) {
		return;
	}
	const preset = readPresetFromElements(elements);
	nodes.preset = preset;
	applyVoiceParameters(
		nodes,
		preset,
		nodes.human,
		Boolean(isChord),
		Boolean(isBass),
		AudioState.context.currentTime
	);
}

/** Starts character layers and the main performance envelope at one audio timestamp. */
export function startSynth(nodes, frequency, noteName = '') {
	if (!nodes || nodes.disposed || !AudioState.context) {
		return;
	}
	const now = AudioState.context.currentTime;
	nodes.character = startVoiceCharacter(
		AudioState.context,
		nodes,
		frequency,
		nodes.preset,
		nodes.velocity,
		now
	);
	startVoicePerformance(AudioState.context, nodes, frequency, noteName, getADSR(), now);
}

/** Releases one voice and disposes its graph after the audible tail becomes silent. */
export function stopSynth(nodes, fast = false) {
	if (!nodes || nodes.stopped || !AudioState.context) {
		return;
	}
	const fallback = nodes.preset?.release || 0.34;
	const release = fast
		? 0.035
		: Math.max(0.03, numberFrom(elements.releaseSlider, fallback));
	scheduleVoiceStop(nodes, release, AudioState.context.currentTime, disposeSynth);
}

/** Disconnects one completed voice graph exactly once. */
export function disposeSynth(nodes) {
	disposeVoiceGraph(nodes);
}

function numberFrom(element, fallback) {
	const value = Number.parseFloat(element?.value ?? fallback);
	return Number.isFinite(value) ? value : fallback;
}
