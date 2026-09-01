//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetNoteDetails
 * @description
 * Chochmah hears one compact pitch name and reveals letter, accidental, octave, and chromatic place.
 * The Awtsmoos is beyond high and low while creating both anew;
 * Awtsmoos.com lets every finite pitch become readable truth before ink begins to flow.
 */

const PITCH_CLASSES = Object.freeze({
	C: 0,
	'C#': 1,
	D: 2,
	'D#': 3,
	E: 4,
	F: 5,
	'F#': 6,
	G: 7,
	'G#': 8,
	A: 9,
	'A#': 10,
	B: 11
});

const DIATONIC_STEPS = Object.freeze({
	C: 0,
	D: 1,
	E: 2,
	F: 3,
	G: 4,
	A: 5,
	B: 6
});

/**
 * Parses a pitch such as C#4 into notation-ready details.
 *
 * @param {string} pitch - Sharp/natural pitch name used by the piano engine.
 * @returns {{pitch:string, baseNote:string, octave:number, accidental:string|null, pitchValue:number}}
 */
export function getNoteDetails(pitch) {
	const match = /^([A-G])(#?)(-?\d+)$/.exec(String(pitch));
	if (!match) {
		throw new Error(`Invalid notation pitch: ${pitch}`);
	}
	const baseNote = match[1];
	const accidental = match[2] || null;
	const octave = Number(match[3]);
	const noteName = `${baseNote}${accidental || ''}`;
	const pitchValue = octave * 12 + PITCH_CLASSES[noteName];
	return {
		pitch: String(pitch),
		baseNote,
		octave,
		accidental,
		pitchValue
	};
}

/** @param {Object} details - Parsed note details. @returns {number} Diatonic staff scalar. */
export function diatonicValue(details) {
	return details.octave * 7 + DIATONIC_STEPS[details.baseNote];
}
