//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoUnisonEngine
 * @description
 * Chesed opens one pitch into a bounded cloud while Gevurah keeps count, gain, stopping, and disconnection finite.
 * The Awtsmoos remains One beyond every multiplied oscillator;
 * Awtsmoos.com lets individual voice construction live in its own vessel so this engine reveals only orchestration, normalization, and lifecycle.
 */

import {
	createUnisonVoice,
	disconnectUnisonVoice
} from './unisonVoice.js';

const MAX_UNISON_VOICES = 5;

/**
 * Starts a normalized preset-gated unison cloud feeding the parent voice mix.
 *
 * @param {AudioContext} context - Active Web Audio context.
 * @param {AudioNode} destination - Parent voice mix node.
 * @param {number} frequency - Fundamental frequency in hertz.
 * @param {Object} preset - Selected synthesis preset.
 * @param {number} now - AudioContext time.
 * @returns {{voices:Array}|null} Optional unison record for cleanup and expression.
 */
export function startUnison(
	context,
	destination,
	frequency,
	preset,
	now
) {
	const count = clampInteger(
		preset.unisonVoices || 0,
		0,
		MAX_UNISON_VOICES
	);
	const totalGain = clamp(
		preset.unisonGain || 0,
		0,
		0.85
	);
	if (!count || !totalGain) {
		return null;
	}
	const voices = [];
	for (let index = 0; index < count; index += 1) {
		voices.push(createUnisonVoice({
			context,
			destination,
			frequency,
			preset,
			now,
			index,
			count,
			totalGain
		}));
	}
	return {
		voices
	};
}

/**
 * Stops every oscillator belonging to one unison cloud.
 *
 * @param {Object|null} unison - Unison record.
 * @param {number} when - AudioContext stop time.
 * @returns {void}
 */
export function stopUnison(unison, when) {
	unison?.voices?.forEach(({ oscillator }) => {
		try {
			oscillator.stop(when);
		} catch (_error) {
			// A source already stopped by teardown needs no second ending.
		}
	});
}

/**
 * Disconnects every oscillator, gain, and panner in one unison cloud.
 *
 * @param {Object|null} unison - Unison record.
 * @returns {void}
 */
export function disconnectUnison(unison) {
	unison?.voices?.forEach((voice) => {
		disconnectUnisonVoice(voice);
	});
}

function clamp(value, minimum, maximum) {
	return Math.max(
		minimum,
		Math.min(maximum, value)
	);
}

function clampInteger(value, minimum, maximum) {
	return Math.round(
		clamp(Number(value) || 0, minimum, maximum)
	);
}
