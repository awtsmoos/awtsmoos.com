//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetNoteChordDrawing
 * @description
 * Tiferes gathers simultaneous tones into one chordal vessel, choosing a shared stem and nudging neighboring heads apart.
 * The Awtsmoos is beyond one and many while creating both in perfect unity;
 * Awtsmoos.com keeps chord geometry separate so harmony stays readable and each responsibility can grow freely.
 */

import { SCORE_CONFIG } from './constants.js';
import {
	getNoteY,
	middleStaffY
} from './staffGeometry.js';
import { drawFlags } from './noteFlagDrawing.js';
import { drawNoteGlyph } from './noteGlyph.js';

/**
 * Draws one simultaneous note group using a shared stem-direction decision.
 *
 * @param {CanvasRenderingContext2D} context - Score context.
 * @param {Object[]} group - Simultaneous structured notes.
 * @param {number} x - Group X coordinate.
 * @param {number} yOffset - Staff top line.
 * @param {'treble'|'bass'} clef - Staff clef.
 * @returns {void}
 */
export function drawBeatGroup(
	context,
	group,
	x,
	yOffset,
	clef
) {
	const middleY = middleStaffY(yOffset);
	const furthest = findFurthestNote(
		group,
		yOffset,
		clef,
		middleY
	);
	const furthestY = getNoteY(
		furthest.details,
		yOffset,
		clef
	);
	const stemDirection = furthestY > middleY ? -1 : 1;
	assignChordOffsets(group, yOffset, clef);
	let lastStem = null;

	for (const note of group) {
		const offset = note.render_x_offset || 0;
		const noteX = stemDirection === 1
			? x + offset
			: x - offset;
		lastStem = drawNoteGlyph(
			context,
			note,
			noteX,
			yOffset,
			stemDirection,
			clef
		);
		note.render_x_offset = 0;
	}

	if (group.length === 1 && lastStem?.stemX !== undefined) {
		drawFlags(
			context,
			lastStem.stemX,
			lastStem.stemYend,
			stemDirection,
			group[0].duration
		);
	}
}

function findFurthestNote(group, yOffset, clef, middleY) {
	return group.reduce((current, note) => {
		const noteDistance = Math.abs(
			getNoteY(note.details, yOffset, clef) - middleY
		);
		const currentDistance = Math.abs(
			getNoteY(current.details, yOffset, clef) - middleY
		);
		return noteDistance > currentDistance
			? note
			: current;
	});
}

function assignChordOffsets(group, yOffset, clef) {
	for (let index = 0; index < group.length - 1; index += 1) {
		const firstY = getNoteY(
			group[index].details,
			yOffset,
			clef
		);
		const secondY = getNoteY(
			group[index + 1].details,
			yOffset,
			clef
		);
		const close = Math.abs(firstY - secondY)
			< SCORE_CONFIG.STAFF_LINE_GAP - 2;
		group[index].render_x_offset = 0;
		group[index + 1].render_x_offset = close
			? SCORE_CONFIG.NOTE_HEAD_RADIUS_X * 2
			: 0;
	}
}
