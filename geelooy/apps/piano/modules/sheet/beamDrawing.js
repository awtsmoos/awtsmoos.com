//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetBeamDrawing
 * @description
 * Netzach binds swift notes into one directional current while keeping every stem joined to the same horizon.
 * The Awtsmoos is beyond speed while creating each subdivision anew;
 * Awtsmoos.com caps the beam's slope so urgency remains readable and the written river knows how to flow.
 */

import {
	notationWidth,
	SCORE_CONFIG
} from './constants.js';
import {
	getNoteY,
	middleStaffY
} from './staffGeometry.js';
import { drawNoteGlyph } from './noteGlyph.js';

/**
 * Draws a contiguous group of eighth/sixteenth note groups under one primary beam.
 *
 * @param {CanvasRenderingContext2D} context - Score context.
 * @param {Object[][]} groups - Consecutive beat groups.
 * @param {number} x - Starting X coordinate.
 * @param {number} yOffset - Staff top line.
 * @param {number} ratio - Horizontal layout ratio.
 * @param {'treble'|'bass'} clef - Target clef.
 * @returns {void}
 */
export function drawBeamGroup(context, groups, x, yOffset, ratio, clef) {
	const positions = collectNotePositions(groups, x, ratio);
	const middleY = middleStaffY(yOffset);
	const averageY = positions.reduce((sum, position) => {
		return sum + getNoteY(position.note.details, yOffset, clef);
	}, 0) / positions.length;
	const stemDirection = averageY > middleY ? -1 : 1;
	const stems = positions.map((position) => {
		return {
			...drawNoteGlyph(
				context,
				position.note,
				position.x,
				yOffset,
				stemDirection,
				clef
			),
			note: position.note
		};
	});
	drawPrimaryBeam(context, stems);
}

function collectNotePositions(groups, startX, ratio) {
	const positions = [];
	let currentX = startX;
	for (const group of groups) {
		for (const note of group) {
			positions.push({ note, x: currentX });
		}
		currentX += notationWidth(group[0].value, ratio);
	}
	return positions;
}

function drawPrimaryBeam(context, stems) {
	const first = stems[0];
	const last = stems[stems.length - 1];
	let beamY2 = last.stemYend;
	const span = last.stemX - first.stemX || 1;
	const slope = (beamY2 - first.stemYend) / span;
	if (Math.abs(slope) > 0.6) {
		beamY2 = first.stemYend + Math.sign(slope) * Math.abs(span) * 0.6;
	}
	context.lineWidth = SCORE_CONFIG.BEAM_THICKNESS;
	context.beginPath();
	context.moveTo(first.stemX, first.stemYend);
	context.lineTo(last.stemX, beamY2);
	context.stroke();

	for (const stem of stems) {
		const progress = (stem.stemX - first.stemX) / span;
		const beamY = first.stemYend
			+ (beamY2 - first.stemYend) * progress;
		context.lineWidth = 1.8;
		context.beginPath();
		context.moveTo(stem.stemX, stem.noteY);
		context.lineTo(stem.stemX, beamY);
		context.stroke();
	}
}
