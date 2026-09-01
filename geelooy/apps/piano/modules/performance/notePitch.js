//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoPerformanceNotePitch
 * @description
 * Binah gives note names and MIDI numbers one reversible bridge while the Awtsmoos remains beyond number and letter.
 * Awtsmoos.com keeps this arithmetic pure so MIDI, arpeggiation, octave expansion, and sorting share one pitch language.
 */

const PITCH_CLASSES = Object.freeze([
	'C', 'C#', 'D', 'D#', 'E', 'F',
	'F#', 'G', 'G#', 'A', 'A#', 'B'
]);

/** @param {number} midiNote - MIDI note number. @returns {string} Scientific pitch name. */
export function midiToNoteName(midiNote) {
	const note = Math.max(
		0,
		Math.min(127, Math.round(Number(midiNote) || 0))
	);
	const pitchClass = PITCH_CLASSES[note % 12];
	const octave = Math.floor(note / 12) - 1;
	return `${pitchClass}${octave}`;
}

/** @param {string} noteName - Scientific pitch name. @returns {number|null} MIDI note number or null. */
export function noteNameToMidi(noteName) {
	const match = String(noteName).match(/^([A-G])(#?)(-?\d+)$/);
	if (!match) {
		return null;
	}
	const pitchClass = `${match[1]}${match[2]}`;
	const pitchIndex = PITCH_CLASSES.indexOf(pitchClass);
	if (pitchIndex < 0) {
		return null;
	}
	return (Number.parseInt(match[3], 10) + 1) * 12 + pitchIndex;
}

/** @param {string} noteName @param {number} octaves @returns {string|null} Transposed note name. */
export function transposeNoteOctaves(noteName, octaves) {
	const midi = noteNameToMidi(noteName);
	if (midi === null) {
		return null;
	}
	const transposed = midi + Math.round(Number(octaves) || 0) * 12;
	return transposed >= 0 && transposed <= 127
		? midiToNoteName(transposed)
		: null;
}
