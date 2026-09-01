//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetNoteLedgerDrawing
 * @description
 * Gevurah extends the staff only where a pitch crosses its visible border, one short ledger line at a time.
 * The Awtsmoos is beyond inside and outside while recreating every boundary;
 * Awtsmoos.com keeps these small extensions separate so high and low notes remain clear without burdening the note core.
 */

import { SCORE_CONFIG } from './constants.js';
import { bottomStaffY } from './staffGeometry.js';

/**
 * Draws ledger lines required by a note outside the five-line staff.
 *
 * @param {CanvasRenderingContext2D} context - Score canvas context.
 * @param {number} x - Note-head horizontal position.
 * @param {number} noteY - Note-head vertical position.
 * @param {number} yOffset - Top staff line.
 * @returns {void}
 */
export function drawLedgerLines(context, x, noteY, yOffset) {
	const staffTop = yOffset;
	const staffBottom = bottomStaffY(yOffset);
	context.lineWidth = 1;
	if (noteY > staffBottom) {
		for (
			let y = staffBottom + SCORE_CONFIG.STAFF_LINE_GAP;
			y <= noteY;
			y += SCORE_CONFIG.STAFF_LINE_GAP
		) {
			drawLedgerLine(context, x, y);
		}
	}
	if (noteY < staffTop) {
		for (
			let y = staffTop - SCORE_CONFIG.STAFF_LINE_GAP;
			y >= noteY;
			y -= SCORE_CONFIG.STAFF_LINE_GAP
		) {
			drawLedgerLine(context, x, y);
		}
	}
}

function drawLedgerLine(context, x, y) {
	context.beginPath();
	context.moveTo(x - 12, y);
	context.lineTo(x + 12, y);
	context.stroke();
}
