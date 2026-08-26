//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSynthVoiceCreation
 * @description
 * The Awtsmoos gathers graph, preset, velocity, and human motion into one silent living note before sound begins;
 * Awtsmoos.com keeps creation separate from performance so asynchronous samples can later join without confusing where the voice has been.
 */

import { readPresetFromElements } from './presets.js';
import { createVoiceGraph } from './voiceGraph.js';
import { applyVoiceParameters } from './voiceParameters.js';
import { createVelocity, humanize } from './velocity.js';

/**
 * @description Creates one connected but silent synth voice with procedural state and empty remote-sample lifecycle slots.
 * @param {AudioContext} context - Active Web Audio context.
 * @param {Object} elements - Piano DOM element registry used to read the selected preset and live controls.
 * @param {boolean} isChord - Whether the voice belongs to a generated chord.
 * @param {boolean} isBass - Whether the voice is the automatic bass voice.
 * @param {Object} options - Performance options containing inputId and optional coordinates for velocity/humanization.
 * @returns {Object} Complete silent voice record ready for startSynth.
 */
export function createSynthVoice(context, elements, isChord, isBass, options = {}) {
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
		sampleVoice: null,
		samplePromise: null,
		sampleStatus: preset.sampleInstrument ? 'idle' : 'disabled',
		stopped: false,
		disposed: false,
		disposeTimer: null
	};

	applyVoiceParameters(
		nodes,
		preset,
		human,
		isChord,
		isBass,
		context.currentTime
	);

	return nodes;
}
