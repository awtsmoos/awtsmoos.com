//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleSelector
 * @description
 * The Awtsmoos lets one recorded anchor illuminate nearby notes without pretending distance is free;
 * Awtsmoos.com places Gevurah around transposition, while exact drums remain exactly what they should be.
 */

import {
	noteToMidi,
	playbackRateForSemitones
} from './samplePitch.js';

/**
 * @description Selects the nearest articulation-compatible anchor while enforcing an explicit semitone transposition ceiling.
 * @param {Array<Object>} samples - Candidate manifest samples belonging to one instrument.
 * @param {string} noteName - Requested scientific pitch such as C4, F#3, or Eb5.
 * @param {string|null} articulation - Preferred articulation; falls back to all candidates only when no exact articulation exists.
 * @param {number} [maxTranspose=6] - Maximum allowed absolute semitone displacement; zero creates exact-note one-shot semantics.
 * @returns {Object|null} Selection containing sample, targetMidi, semitoneDelta, and playbackRate, or null when no honest anchor exists.
 */
export function selectSample(samples = [], noteName, articulation, maxTranspose = 6) {
	const targetMidi = noteToMidi(noteName);

	if (!Number.isFinite(targetMidi)) {
		return null;
	}

	const candidates = samplesForArticulation(samples, articulation);
	const nearest = nearestSample(candidates, targetMidi);

	if (!nearest || nearest.distance > Math.max(0, maxTranspose)) {
		return null;
	}

	const semitoneDelta = targetMidi - nearest.sample.midi;

	return {
		sample: nearest.sample,
		targetMidi,
		semitoneDelta,
		playbackRate: playbackRateForSemitones(semitoneDelta)
	};
}

/**
 * @description Prefers exact articulation matches while retaining backward compatibility for banks that omit the requested articulation.
 * @param {Array<Object>} samples - Candidate samples for one instrument.
 * @param {string|null} articulation - Requested articulation identifier.
 * @returns {Array<Object>} Exact articulation subset when available, otherwise the original candidate collection.
 */
function samplesForArticulation(samples, articulation) {
	if (!articulation) {
		return samples;
	}

	const exact = samples.filter((sample) => {
		return sample.articulation === articulation;
	});

	return exact.length > 0 ? exact : samples;
}

/**
 * @description Finds the minimum MIDI-distance sample without applying transposition policy, keeping geometry separate from permission.
 * @param {Array<Object>} samples - Articulation-compatible sample records.
 * @param {number} targetMidi - Requested MIDI note number.
 * @returns {{sample:Object,distance:number}|null} Nearest candidate and absolute semitone distance, or null when no candidates exist.
 */
function nearestSample(samples, targetMidi) {
	let nearest = null;

	samples.forEach((sample) => {
		const distance = Math.abs(targetMidi - sample.midi);

		if (!nearest || distance < nearest.distance) {
			nearest = {
				sample,
				distance
			};
		}
	});

	return nearest;
}
