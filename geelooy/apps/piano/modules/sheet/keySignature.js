//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetKeySignature
 * @description
 * Binah listens to repeated accidentals and chooses the circle-of-fifths garment that explains them with least strain.
 * The Awtsmoos is beyond key and modulation while renewing every tone;
 * Awtsmoos.com lets notation infer a modest signature without pretending the melody is fully known.
 */

import { getNoteDetails } from './noteDetails.js';

const CIRCLE_OF_FIFTHS = Object.freeze({
	C: [],
	G: ['F#'],
	D: ['F#', 'C#'],
	A: ['F#', 'C#', 'G#'],
	E: ['F#', 'C#', 'G#', 'D#'],
	B: ['F#', 'C#', 'G#', 'D#', 'A#'],
	'F#': ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'],
	F: ['Bb'],
	Bb: ['Bb', 'Eb'],
	Eb: ['Bb', 'Eb', 'Ab'],
	Ab: ['Bb', 'Eb', 'Ab', 'Db'],
	Db: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'],
	Gb: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb']
});

/**
 * Infers a display key signature from quantized note accidentals.
 *
 * @param {Object[]} notes - Quantized notes/rests.
 * @returns {{key:string, accidentals:string[]}} Best-scoring signature.
 */
export function determineKeySignature(notes) {
	const accidentalCounts = countAccidentals(notes);
	let bestKey = 'C';
	let maximumScore = 0;

	for (const [key, accidentals] of Object.entries(CIRCLE_OF_FIFTHS)) {
		const score = signatureScore(accidentals, accidentalCounts);
		if (score > maximumScore) {
			maximumScore = score;
			bestKey = key;
		}
	}

	return {
		key: bestKey,
		accidentals: [...CIRCLE_OF_FIFTHS[bestKey]]
	};
}

function countAccidentals(notes) {
	const counts = {};
	for (const item of notes) {
		if (item.type !== 'note') {
			continue;
		}
		const details = getNoteDetails(item.pitch);
		if (!details.accidental) {
			continue;
		}
		const name = `${details.baseNote}${details.accidental}`;
		counts[name] = (counts[name] || 0) + 1;
	}
	return counts;
}

function signatureScore(accidentals, counts) {
	let score = 0;
	for (const accidental of accidentals) {
		if (counts[accidental]) {
			score += counts[accidental] * 2;
		}
	}
	for (const countedAccidental of Object.keys(counts)) {
		if (!accidentals.includes(countedAccidental)) {
			score -= 1;
		}
	}
	return score;
}
