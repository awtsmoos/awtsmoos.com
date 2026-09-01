//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoUnisonVoice
 * @description
 * Hod clothes one unison position in oscillator, gain, panner, waveform, and remembered detune while the Awtsmoos remains One beyond every multiplied voice.
 * Awtsmoos.com keeps individual-cloud construction separate from unison orchestration,
 * so expressive pitch bend can return each voice to its exact base spread and lifecycle code can remain small enough to reveal its purpose.
 */

import { customWaves } from '../waveforms.js';

const STANDARD_WAVES = new Set([
	'sine',
	'square',
	'sawtooth',
	'triangle'
]);

/**
 * Creates and starts one normalized unison voice.
 *
 * @param {Object} options - Context, destination, pitch, preset, time and position data.
 * @returns {{oscillator:OscillatorNode,gain:GainNode,panner:AudioNode,baseDetune:number}} Voice record.
 */
export function createUnisonVoice(options) {
	const oscillator = options.context.createOscillator();
	const gain = options.context.createGain();
	const panner = options.context.createStereoPanner
		? options.context.createStereoPanner()
		: options.context.createGain();
	const position = normalizedPosition(
		options.index,
		options.count
	);
	const baseDetune = position
		* clamp(options.preset.unisonDetune || 0, 0, 60)
		+ driftFor(options.index);
	applyWave(
		oscillator,
		options.preset.unisonWave || options.preset.wave1
	);
	oscillator.frequency.setValueAtTime(
		options.frequency,
		options.now
	);
	oscillator.detune.setValueAtTime(baseDetune, options.now);
	gain.gain.setValueAtTime(
		options.totalGain / options.count,
		options.now
	);
	if (panner.pan) {
		panner.pan.setValueAtTime(
			position * clamp(options.preset.unisonSpread || 0, 0, 1),
			options.now
		);
	}
	oscillator.connect(gain);
	gain.connect(panner);
	panner.connect(options.destination);
	oscillator.start(options.now);
	return {
		oscillator,
		gain,
		panner,
		baseDetune
	};
}

/**
 * Disconnects one unison voice record defensively during teardown.
 *
 * @param {Object} voice - Unison voice record.
 * @returns {void}
 */
export function disconnectUnisonVoice(voice) {
	disconnectNode(voice?.oscillator);
	disconnectNode(voice?.gain);
	disconnectNode(voice?.panner);
}

function normalizedPosition(index, count) {
	return count <= 1
		? 0
		: -1 + (2 * index) / (count - 1);
}

function driftFor(index) {
	return index % 2 === 0 ? -0.27 : 0.27;
}

function applyWave(oscillator, wave) {
	if (customWaves[wave]) {
		oscillator.setPeriodicWave(customWaves[wave]);
		return;
	}
	oscillator.type = STANDARD_WAVES.has(wave)
		? wave
		: 'sawtooth';
}

function disconnectNode(node) {
	try {
		node?.disconnect();
	} catch (_error) {
		// Browser disposal can race with explicit disconnect safely.
	}
}

function clamp(value, minimum, maximum) {
	return Math.max(
		minimum,
		Math.min(maximum, value)
	);
}
