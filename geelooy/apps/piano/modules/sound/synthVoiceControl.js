//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSynthVoiceControl
 * @description
 * The Awtsmoos lets controls shape a living voice without rebuilding its hidden graph;
 * Awtsmoos.com keeps ADSR, creation, and live parameter refresh together while runtime start/stop walks another path.
 */

import { AudioState } from '../audio.js';
import { elements } from '../ui.js';
import { readPresetFromElements } from './presets.js';
import { createSynthVoice } from './synthVoiceCreation.js';
import { readVoiceAdsr } from './synthVoiceSettings.js';
import { applyVoiceParameters } from './voiceParameters.js';

/**
 * @description Reads visible ADSR controls through the dedicated settings policy while preserving the historic public synth API.
 * @returns {{attack:number,decay:number,sustain:number,release:number}} Current ADSR envelope values.
 */
export function getADSR() {
	return readVoiceAdsr(elements);
}

/**
 * @description Creates one connected but silent procedural/hybrid voice using the current preset and performance input.
 * @param {boolean} [isChord=false] - Whether the voice belongs to a generated chord.
 * @param {boolean} [isBass=false] - Whether the voice belongs to automatic bass accompaniment.
 * @param {Object} [options={}] - Performance options containing inputId and optional coordinates.
 * @returns {Object|null} Silent synth voice, or null when audio has not been initialized.
 */
export function createSynthNode(isChord = false, isBass = false, options = {}) {
	const context = AudioState.context;

	if (!context || !AudioState.masterGain) {
		return null;
	}

	return createSynthVoice(context, elements, isChord, isBass, options);
}

/**
 * @description Applies current live controls to an existing procedural graph without rebuilding or restarting its already-attached sample layer.
 * @param {Object} nodes - Existing synth voice record.
 * @param {boolean} [isChord=nodes.isChord] - Whether chord voicing rules should apply.
 * @param {boolean} [isBass=nodes.isBass] - Whether bass voicing rules should apply.
 * @returns {void}
 */
export function applyCurrentParameters(
	nodes,
	isChord = nodes?.isChord,
	isBass = nodes?.isBass
) {
	const context = AudioState.context;

	if (!nodes || nodes.disposed || !context) {
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
		context.currentTime
	);
}
