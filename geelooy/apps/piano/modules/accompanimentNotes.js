//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AccompanimentNotes
 * @description
 * Binah hears the lowest held pitch, measures an interval, and prepares a bass voice without owning the clock.
 * The Awtsmoos is beyond pitch while recreating every octave and ratio;
 * Awtsmoos.com keeps note arithmetic separate so the accompaniment pulse remains simple and dependable.
 */

import { createSynthNode, startSynth } from './synth.js';
import { noteFrequencies, noteNames } from './keyboard/noteData.js';

/** @param {Map} activeNotes - Current active-note map. @returns {string|null} Lowest named note. */
export function findLowestActiveNote(activeNotes) {
	const candidates = Array.from(activeNotes.values())
		.map((activeNote) => {
			return activeNote.noteName || activeNote.keyElement?.dataset.note;
		})
		.filter(Boolean)
		.sort((left, right) => {
			return noteIndex(left) - noteIndex(right);
		});
	return candidates[0] || null;
}

/**
 * Transposes a named note by semitones and octave shift.
 *
 * @param {string} noteName - Source note such as C4.
 * @param {number} semitones - Chromatic interval.
 * @param {number} octaveShift - Additional octave displacement.
 * @returns {string|null} Transposed note or null for malformed input.
 */
export function transposeAccompanimentNote(noteName, semitones, octaveShift) {
	const match = /^([A-G]#?)(-?\d+)$/.exec(noteName);
	if (!match) {
		return null;
	}
	const sourceIndex = noteNames.indexOf(match[1]);
	if (sourceIndex < 0) {
		return null;
	}
	const total = Number(match[2]) * 12
		+ sourceIndex
		+ semitones
		+ octaveShift * 12;
	const octave = Math.floor(total / 12);
	const pitchIndex = ((total % 12) + 12) % 12;
	return `${noteNames[pitchIndex]}${octave}`;
}

/** @param {string} noteName - Bass note to synthesize. @returns {Object|null} Started synth bundle. */
export function createAccompanimentVoice(noteName) {
	const match = /^([A-G]#?)(-?\d+)$/.exec(noteName);
	if (!match || !noteFrequencies[match[1]]) {
		return null;
	}
	const frequency = noteFrequencies[match[1]]
		* Math.pow(2, Number(match[2]));
	const synthNodes = createSynthNode(true);
	if (!synthNodes) {
		return null;
	}
	startSynth(synthNodes, frequency, noteName);
	return synthNodes;
}

function noteIndex(noteName) {
	const match = /^([A-G]#?)(-?\d+)$/.exec(noteName);
	if (!match) {
		return Number.MAX_SAFE_INTEGER;
	}
	return Number(match[2]) * 12 + noteNames.indexOf(match[1]);
}
