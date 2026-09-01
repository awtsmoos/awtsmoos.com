//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoKeyGeometry
 * @description
 * Gevurah gives every chromatic pitch one exact finite place while the Awtsmoos remains beyond left, right, white, and black.
 * Awtsmoos.com makes accidental placement a pure law instead of a side effect of DOM order,
 * so every width can change while each sharp still rests precisely upon the border from which its visible form is drawn.
 */

export const BLACK_KEY_WIDTH_RATIO = 0.62;
export const BLACK_KEY_HEIGHT_RATIO = 0.63;
export const WHITE_KEYS_PER_OCTAVE = 7;
export const MAX_KEYBOARD_NOTE_VALUE = 8.5;

const PITCH_GEOMETRY = Object.freeze({
	C: { whiteIndex: 0 },
	'C#': { boundaryIndex: 1 },
	D: { whiteIndex: 1 },
	'D#': { boundaryIndex: 2 },
	E: { whiteIndex: 2 },
	F: { whiteIndex: 3 },
	'F#': { boundaryIndex: 4 },
	G: { whiteIndex: 4 },
	'G#': { boundaryIndex: 5 },
	A: { whiteIndex: 5 },
	'A#': { boundaryIndex: 6 },
	B: { whiteIndex: 6 }
});

/**
 * Returns deterministic key geometry relative to one octave base.
 *
 * @param {string} pitchClass - Chromatic pitch class such as C or F#.
 * @param {number} octaveBaseX - Pixel offset where the octave begins.
 * @param {number} whiteKeyWidth - Current white-key width in pixels.
 * @returns {{isBlack:boolean,left:number,width:number,heightRatio:number,whiteAdvance:number}}
 */
export function keyGeometryForPitchClass(
	pitchClass,
	octaveBaseX,
	whiteKeyWidth
) {
	const definition = PITCH_GEOMETRY[pitchClass];
	if (!definition) {
		throw new Error(`Unknown piano pitch class: ${pitchClass}`);
	}
	if (Number.isFinite(definition.whiteIndex)) {
		return {
			isBlack: false,
			left: octaveBaseX + definition.whiteIndex * whiteKeyWidth,
			width: whiteKeyWidth,
			heightRatio: 1,
			whiteAdvance: 1
		};
	}
	const width = whiteKeyWidth * BLACK_KEY_WIDTH_RATIO;
	return {
		isBlack: true,
		left: octaveBaseX
			+ definition.boundaryIndex * whiteKeyWidth
			- width / 2,
		width,
		heightRatio: BLACK_KEY_HEIGHT_RATIO,
		whiteAdvance: 0
	};
}

/**
 * Tests whether a chromatic note remains inside the historical piano range.
 *
 * @param {number} octave - Display octave.
 * @param {number} pitchIndex - Chromatic index from C=0 through B=11.
 * @returns {boolean} Whether the note may render.
 */
export function noteIsInsideKeyboardRange(octave, pitchIndex) {
	return octave + pitchIndex / 12 <= MAX_KEYBOARD_NOTE_VALUE;
}

/**
 * Prevents a terminal accidental from hanging beyond a missing right white key.
 *
 * @param {number} octave - Display octave.
 * @param {number} pitchIndex - Current chromatic index.
 * @param {string[]} noteNames - Ordered chromatic pitch classes.
 * @returns {boolean} Whether the key has valid visible neighbors.
 */
export function accidentalHasRightNeighbor(
	octave,
	pitchIndex,
	noteNames
) {
	if (!String(noteNames[pitchIndex]).includes('#')) {
		return true;
	}
	const rightIndex = pitchIndex + 1;
	return rightIndex < noteNames.length
		&& noteIsInsideKeyboardRange(octave, rightIndex);
}
