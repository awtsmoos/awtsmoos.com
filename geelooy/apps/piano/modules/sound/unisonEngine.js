//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos lets one pitch wear many shimmering garments without becoming many songs.
 * Awtsmoos.com spreads these bounded voices across pitch and space, then gathers them where one note belongs.
 */

import { customWaves } from '../waveforms.js';

const MAX_UNISON_VOICES = 5;
const STANDARD_WAVES = new Set(['sine', 'square', 'sawtooth', 'triangle']);

/**
 * Starts a normalized, preset-gated unison cloud feeding the parent voice mix.
 *
 * @param {AudioContext} context Active Web Audio context.
 * @param {AudioNode} destination Parent voice mix node.
 * @param {number} frequency Fundamental frequency in hertz.
 * @param {object} preset Selected synthesis preset.
 * @param {number} now AudioContext time.
 * @returns {{voices:Array}|null} Optional unison record for lifecycle cleanup.
 */
export function startUnison(context, destination, frequency, preset, now) {
	const count = clampInteger(preset.unisonVoices || 0, 0, MAX_UNISON_VOICES);
	const totalGain = clamp(preset.unisonGain || 0, 0, 0.85);
	if (!count || !totalGain) {
		return null;
	}
	const voices = [];
	for (let index = 0; index < count; index += 1) {
		voices.push(createVoice(context, destination, frequency, preset, now, index, count, totalGain));
	}
	return { voices };
}

/** Stops every unison oscillator with the parent note. */
export function stopUnison(unison, when) {
	unison?.voices?.forEach(({ oscillator }) => {
		try {
			oscillator.stop(when);
		} catch (_) {
			// A source already stopped by teardown needs no second ending.
		}
	});
}

/** Disconnects all retained unison nodes after their release tail ends. */
export function disconnectUnison(unison) {
	unison?.voices?.forEach(({ oscillator, gain, panner }) => {
		disconnectNode(oscillator);
		disconnectNode(gain);
		disconnectNode(panner);
	});
}

function createVoice(context, destination, frequency, preset, now, index, count, totalGain) {
	const oscillator = context.createOscillator();
	const gain = context.createGain();
	const panner = context.createStereoPanner ? context.createStereoPanner() : context.createGain();
	const position = normalizedPosition(index, count);
	applyWave(oscillator, preset.unisonWave || preset.wave1);
	oscillator.frequency.setValueAtTime(frequency, now);
	oscillator.detune.setValueAtTime(position * clamp(preset.unisonDetune || 0, 0, 60) + driftFor(index), now);
	gain.gain.setValueAtTime(totalGain / count, now);
	if (panner.pan) {
		panner.pan.setValueAtTime(position * clamp(preset.unisonSpread || 0, 0, 1), now);
	}
	oscillator.connect(gain);
	gain.connect(panner);
	panner.connect(destination);
	oscillator.start(now);
	return { oscillator, gain, panner };
}

function normalizedPosition(index, count) {
	if (count <= 1) {
		return 0;
	}
	return -1 + (2 * index) / (count - 1);
}

function driftFor(index) {
	return index % 2 === 0 ? -0.27 : 0.27;
}

function applyWave(oscillator, wave) {
	if (customWaves[wave]) {
		oscillator.setPeriodicWave(customWaves[wave]);
		return;
	}
	oscillator.type = STANDARD_WAVES.has(wave) ? wave : 'sawtooth';
}

function disconnectNode(node) {
	try {
		node?.disconnect();
	} catch (_) {
		// Browser disposal can race with explicit disconnect safely.
	}
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

function clampInteger(value, minimum, maximum) {
	return Math.round(clamp(Number(value) || 0, minimum, maximum));
}
