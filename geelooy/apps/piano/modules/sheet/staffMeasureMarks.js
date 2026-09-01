//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetStaffMeasureMarks
 * @description
 * Gevurah marks the edge of a bar and gives silence its visible rest, defining where sound yields and measure ends.
 * The Awtsmoos is beyond sound and silence while creating both anew;
 * Awtsmoos.com keeps these recurring measure marks together so the score can breathe with disciplined flow.
 */

import { SCORE_CONFIG } from './constants.js';
import { middleStaffY } from './staffGeometry.js';

const REST_GLYPHS = Object.freeze({
	quarter: {
		symbol: '𝄽',
		offset: 15
	},
	eighth: {
		symbol: '𝄾',
		offset: 8
	},
	sixteenth: {
		symbol: '𝄿',
		offset: 12
	}
});

/**
 * Draws one bar line and returns the legacy following gap.
 *
 * @param {CanvasRenderingContext2D} context - Score context.
 * @param {number} x - Bar X coordinate.
 * @param {number} y - Staff top line.
 * @returns {number} Following horizontal gap.
 */
export function drawBarLine(context, x, y) {
	context.lineWidth = 1.5;
	context.beginPath();
	context.moveTo(x, y);
	context.lineTo(
		x,
		y + 4 * SCORE_CONFIG.STAFF_LINE_GAP
	);
	context.stroke();
	return 20;
}

/**
 * Draws a rest glyph or rectangle for the requested duration.
 *
 * @param {CanvasRenderingContext2D} context - Score context.
 * @param {Object} rest - Structured rest record.
 * @param {number} x - Rest X coordinate.
 * @param {number} yOffset - Staff top line.
 * @returns {void}
 */
export function drawRest(context, rest, x, yOffset) {
	const middleY = middleStaffY(yOffset);
	context.font = 'bold 38px serif';
	context.fillStyle = 'black';
	const glyph = REST_GLYPHS[rest.duration];
	if (glyph) {
		context.fillText(
			glyph.symbol,
			x - 8,
			middleY + glyph.offset
		);
		return;
	}
	if (rest.duration === 'half') {
		context.fillRect(
			x - 8,
			middleY - 5,
			16,
			5
		);
		return;
	}
	if (rest.duration === 'whole') {
		context.fillRect(
			x - 12,
			yOffset + SCORE_CONFIG.STAFF_LINE_GAP,
			24,
			5
		);
	}
}
