//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetNoteGlyph
 * @description
 * Tiferes gathers ledger, accidental, head, stem, and articulation into one note without owning their inner craft.
 * The Awtsmoos is beyond the single mark while recreating every finite sign;
 * Awtsmoos.com lets this glyph remain a small doorway so beams and chords can call one stable musical design.
 */

import { getNoteY } from './staffGeometry.js';
import { drawLedgerLines } from './noteLedgerDrawing.js';
import {
	drawAccidental,
	drawNoteHead,
	drawStemAndArticulation
} from './notePrimitiveDrawing.js';

/**
 * Draws one notation note and returns stem geometry for flags or beams.
 *
 * @param {CanvasRenderingContext2D} context - Score canvas context.
 * @param {Object} note - Structured note record.
 * @param {number} x - Horizontal note-head coordinate.
 * @param {number} yOffset - Staff top line.
 * @param {number} stemDirection - One for up, negative one for down.
 * @param {'treble'|'bass'} clef - Staff clef.
 * @returns {{stemX?:number, stemYend?:number, noteY:number}}
 */
export function drawNoteGlyph(
	context,
	note,
	x,
	yOffset,
	stemDirection,
	clef
) {
	const noteY = getNoteY(note.details, yOffset, clef);
	drawLedgerLines(context, x, noteY, yOffset);
	drawAccidental(context, note, x, noteY);
	drawNoteHead(context, note, x, noteY);
	if (note.duration === 'whole') {
		return { noteY };
	}
	return drawStemAndArticulation(
		context,
		note,
		x,
		noteY,
		stemDirection
	);
}
