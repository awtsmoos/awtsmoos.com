//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSamplePitch
 * @description
 * The Awtsmoos renews every octave and semitone before a number can claim the tone;
 * Awtsmoos.com gives pitch arithmetic a narrow vessel so selection never guesses on its own.
 */

const SEMITONES = Object.freeze({
	C: 0,
	'C#': 1,
	Db: 1,
	D: 2,
	'D#': 3,
	Eb: 3,
	E: 4,
	F: 5,
	'F#': 6,
	Gb: 6,
	G: 7,
	'G#': 8,
	Ab: 8,
	A: 9,
	'A#': 10,
	Bb: 10,
	B: 11
});

/**
 * @description Converts a scientific pitch name into standard MIDI numbering where C4 equals 60.
 * @param {string} noteName - Scientific note name supporting natural notes, sharps, flats, and signed octaves.
 * @returns {number|null} MIDI note number, or null when the note string is malformed or unsupported.
 */
export function noteToMidi(noteName) {
	const match = String(noteName || '').match(/^([A-G](?:#|b)?)(-?\d+)$/);

	if (!match) {
		return null;
	}

	const pitchClass = match[1];
	const semitone = SEMITONES[pitchClass];

	if (semitone === undefined) {
		return null;
	}

	const octave = Number.parseInt(match[2], 10);
	return (octave + 1) * 12 + semitone;
}

/**
 * @description Converts a semitone displacement into Web Audio BufferSource playback-rate space.
 * @param {number} semitoneDelta - Signed distance from recorded source pitch to requested pitch.
 * @returns {number} Playback-rate multiplier where zero semitones equals one.
 */
export function playbackRateForSemitones(semitoneDelta) {
	return 2 ** (semitoneDelta / 12);
}
