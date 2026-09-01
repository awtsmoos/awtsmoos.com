//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetStaffSignatureDrawing
 * @description
 * Binah writes the key and meter at the doorway of a system, naming the tonal and rhythmic covenant before notes proceed.
 * The Awtsmoos is beyond key and count while recreating both every instant;
 * Awtsmoos.com keeps these opening signs together so their geometry remains focused, measured, and consistent.
 */

import { SCORE_CONFIG } from './constants.js';

const SHARP_POSITIONS = [0, 1.5, -0.5, 1, 2.5, 0.5, 2];
const FLAT_POSITIONS = [2, 0.5, 2.5, 1, 3, 1.5, 3.5];

/**
 * Draws one key signature and returns its horizontal width.
 *
 * @param {CanvasRenderingContext2D} context - Score context.
 * @param {number} x - Starting X coordinate.
 * @param {number} y - Staff top line.
 * @param {Object} keySignature - Inferred key signature.
 * @returns {number} Horizontal width consumed.
 */
export function drawKeySignature(
	context,
	x,
	y,
	keySignature
) {
	const accidentals = keySignature.accidentals;
	if (accidentals.length === 0) {
		return 0;
	}
	context.font = 'bold 38px serif';
	const isSharp = accidentals[0].includes('#');
	const positions = isSharp
		? SHARP_POSITIONS
		: FLAT_POSITIONS;
	accidentals.forEach((_accidental, index) => {
		const accidentalY = y
			+ 2 * SCORE_CONFIG.STAFF_LINE_GAP
			- positions[index] * SCORE_CONFIG.STAFF_LINE_GAP;
		context.fillText(
			isSharp ? '#' : '♭',
			x + index * 15,
			accidentalY
		);
	});
	return accidentals.length * 15;
}

/**
 * Draws a stacked numeric time signature.
 *
 * @param {CanvasRenderingContext2D} context - Score context.
 * @param {number} x - Starting X coordinate.
 * @param {number} y - Staff top line.
 * @param {Object} timeSignature - Meter record.
 * @returns {number} Horizontal width consumed.
 */
export function drawTimeSignature(
	context,
	x,
	y,
	timeSignature
) {
	context.font = `bold ${SCORE_CONFIG.STAFF_LINE_GAP * 2.8}px serif`;
	context.fillText(
		timeSignature.beats,
		x,
		y + SCORE_CONFIG.STAFF_LINE_GAP * 1.5
	);
	context.fillText(
		timeSignature.beatType,
		x,
		y + SCORE_CONFIG.STAFF_LINE_GAP * 3.5
	);
	return 30;
}
