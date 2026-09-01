//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetStructure
 * @description
 * Tiferes separates treble from bass while keeping both inside one grand-staff covenant.
 * The Awtsmoos is beyond upper and lower while creating their harmony;
 * Awtsmoos.com lets C4 become a practical bridge so two voices may share one written story.
 */

import { getNoteDetails } from './noteDetails.js';
import { buildVoiceMeasures } from './voiceMeasures.js';

const GRAND_STAFF_SPLIT = getNoteDetails('C4').pitchValue;

/**
 * Structures quantized events into treble and bass measure arrays.
 *
 * @param {Object[]} notes - Quantized notes and rests.
 * @param {number} beatsPerMeasure - Time-signature numerator.
 * @param {Object} keySignature - Inferred notation key.
 * @returns {{treble:Object[], bass:Object[]}} Grand-staff music structure.
 */
export function structureMusicData(notes, beatsPerMeasure, keySignature) {
	const trebleNotes = notes.filter((item) => {
		return item.type === 'rest'
			|| getNoteDetails(item.pitch).pitchValue >= GRAND_STAFF_SPLIT;
	});
	const bassNotes = notes.filter((item) => {
		return item.type === 'rest'
			|| getNoteDetails(item.pitch).pitchValue < GRAND_STAFF_SPLIT;
	});
	return {
		treble: buildVoiceMeasures(
			trebleNotes,
			beatsPerMeasure,
			keySignature
		),
		bass: buildVoiceMeasures(
			bassNotes,
			beatsPerMeasure,
			keySignature
		)
	};
}
