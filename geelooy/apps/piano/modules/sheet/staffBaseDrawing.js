//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetStaffBaseDrawing
 * @description
 * Malchus lays the five-line ground and places the grand-staff brace and clefs before any measure begins to move.
 * The Awtsmoos is beyond foundation while creating every finite ground;
 * Awtsmoos.com keeps this structural ink apart from changing signatures so the staff stays simple and sound.
 */

import { SCORE_CONFIG } from './constants.js';

/** @param {CanvasRenderingContext2D} context - Score context. @param {number} yOffset - Staff top line. @returns {void} */
export function drawStaffSystem(context, yOffset) {
	context.lineWidth = 1.5;
	for (let index = 0; index < 5; index += 1) {
		const lineY = yOffset
			+ index * SCORE_CONFIG.STAFF_LINE_GAP;
		context.beginPath();
		context.moveTo(SCORE_CONFIG.STAFF_LEFT_MARGIN, lineY);
		context.lineTo(
			SCORE_CONFIG.PAGE_WIDTH - SCORE_CONFIG.STAFF_RIGHT_MARGIN,
			lineY
		);
		context.stroke();
	}
}

/**
 * Draws the brace and treble/bass clefs that open a grand staff.
 *
 * @param {CanvasRenderingContext2D} context - Score context.
 * @param {number} x - Starting X coordinate.
 * @param {number} yTreble - Treble staff top line.
 * @param {number} yBass - Bass staff top line.
 * @returns {number} Horizontal width consumed by the clef region.
 */
export function drawClefAndBrace(
	context,
	x,
	yTreble,
	yBass
) {
	context.font = '150px serif';
	context.fillText(
		'{',
		x - 15,
		yBass + SCORE_CONFIG.STAFF_LINE_GAP * 3.2
	);
	context.font = '80px serif';
	context.fillText(
		'𝄞',
		x + 20,
		yTreble + SCORE_CONFIG.STAFF_LINE_GAP * 4.5
	);
	context.font = '70px serif';
	context.fillText(
		'𝄢',
		x + 25,
		yBass + SCORE_CONFIG.STAFF_LINE_GAP * 1.5
	);
	return 80;
}
