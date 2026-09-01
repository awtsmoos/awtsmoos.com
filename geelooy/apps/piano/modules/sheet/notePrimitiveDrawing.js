//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetNotePrimitiveDrawing
 * @description
 * Hod gives one pitch its accidental, head, stem, and articulation—the smallest visible grammar of a sounded tone.
 * The Awtsmoos is beyond mark and meaning while constantly creating both;
 * Awtsmoos.com keeps this primitive grammar focused so beams and chords can compose it without hidden growth.
 */

import { SCORE_CONFIG } from './constants.js';

/**
 * Draws a displayed accidental when the structured note requires one.
 *
 * @param {CanvasRenderingContext2D} context - Score context.
 * @param {Object} note - Structured note record.
 * @param {number} x - Note-head X coordinate.
 * @param {number} noteY - Note-head Y coordinate.
 * @returns {void}
 */
export function drawAccidental(context, note, x, noteY) {
	if (!note.displayAccidental) {
		return;
	}
	context.font = '28px serif';
	context.fillText(note.displayAccidental, x - 22, noteY + 5);
}

/**
 * Draws one filled or hollow note head according to duration.
 *
 * @param {CanvasRenderingContext2D} context - Score context.
 * @param {Object} note - Structured note record.
 * @param {number} x - Note-head X coordinate.
 * @param {number} noteY - Note-head Y coordinate.
 * @returns {void}
 */
export function drawNoteHead(context, note, x, noteY) {
	context.beginPath();
	context.ellipse(
		x,
		noteY,
		SCORE_CONFIG.NOTE_HEAD_RADIUS_X,
		SCORE_CONFIG.NOTE_HEAD_RADIUS_Y,
		Math.PI / 15,
		0,
		2 * Math.PI
	);
	const filled = note.duration !== 'whole'
		&& note.duration !== 'half';
	context.fillStyle = 'black';
	if (filled) {
		context.fill();
		return;
	}
	context.lineWidth = 1.5;
	context.stroke();
}

/**
 * Draws a stem and optional staccato dot, returning beam-ready geometry.
 *
 * @param {CanvasRenderingContext2D} context - Score context.
 * @param {Object} note - Structured note record.
 * @param {number} x - Note-head X coordinate.
 * @param {number} noteY - Note-head Y coordinate.
 * @param {number} stemDirection - One for up, negative one for down.
 * @returns {{stemX:number, stemYend:number, noteY:number}}
 */
export function drawStemAndArticulation(
	context,
	note,
	x,
	noteY,
	stemDirection
) {
	const stemX = stemDirection === 1
		? x + SCORE_CONFIG.NOTE_HEAD_RADIUS_X - 1
		: x - SCORE_CONFIG.NOTE_HEAD_RADIUS_X + 1;
	const stemYend = noteY
		- SCORE_CONFIG.STEM_HEIGHT * stemDirection;
	context.lineWidth = 1.8;
	context.beginPath();
	context.moveTo(stemX, noteY);
	context.lineTo(stemX, stemYend);
	context.stroke();
	if (note.articulation === 'staccato') {
		drawStaccatoDot(context, x, noteY, stemDirection);
	}
	return {
		stemX,
		stemYend,
		noteY
	};
}

function drawStaccatoDot(context, x, noteY, stemDirection) {
	const offset = SCORE_CONFIG.NOTE_HEAD_RADIUS_Y + 12;
	const dotY = stemDirection === 1
		? noteY - offset
		: noteY + offset;
	context.beginPath();
	context.arc(x, dotY, 2.5, 0, 2 * Math.PI);
	context.fill();
}
