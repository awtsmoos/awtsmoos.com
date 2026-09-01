//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetSystemRenderer
 * @description
 * Tiferes joins treble and bass into one visible system, carrying signatures and measures across the page in harmony.
 * The Awtsmoos is beyond upper and lower while creating their shared song;
 * Awtsmoos.com lets each system render through small delegates so the page stays lucid and strong.
 */

import {
	SCORE_CONFIG,
	TIME_SIGNATURE
} from './constants.js';
import {
	emptyMeasure,
	measureRenderWidth
} from './layout.js';
import { drawMeasure } from './measureDrawing.js';
import {
	drawBarLine,
	drawClefAndBrace,
	drawKeySignature,
	drawRest,
	drawStaffSystem,
	drawTimeSignature
} from './staffSymbols.js';

/**
 * Renders one complete grand-staff system.
 *
 * @param {CanvasRenderingContext2D} context - Score context.
 * @param {Object} line - Layout line record.
 * @param {number} lineIndex - Zero-based system index.
 * @param {number} yOffset - Treble staff top coordinate.
 * @param {Object} music - Structured music.
 * @param {Object} keySignature - Inferred key signature.
 * @returns {void}
 */
export function renderStaffSystem(
	context,
	line,
	lineIndex,
	yOffset,
	music,
	keySignature
) {
	const yTreble = yOffset;
	const yBass = yOffset + SCORE_CONFIG.STAFF_ROW_HEIGHT;
	let x = SCORE_CONFIG.STAFF_LEFT_MARGIN;
	drawStaffSystem(context, yTreble);
	drawStaffSystem(context, yBass);
	x += drawClefAndBrace(context, x, yTreble, yBass) + 10;
	if (lineIndex === 0) {
		x = drawOpeningSignatures(
			context,
			x,
			yTreble,
			yBass,
			keySignature
		);
	}
	for (const measureIndex of line.measureIndices) {
		x = renderMeasurePair(
			context,
			x,
			yTreble,
			yBass,
			music,
			measureIndex
		);
	}
}

function drawOpeningSignatures(context, x, yTreble, yBass, keySignature) {
	const keyWidth = drawKeySignature(context, x, yTreble, keySignature);
	drawKeySignature(context, x, yBass, keySignature);
	x += keyWidth + 15;
	const timeWidth = drawTimeSignature(context, x, yTreble, TIME_SIGNATURE);
	drawTimeSignature(context, x, yBass, TIME_SIGNATURE);
	return x + timeWidth + 20;
}

function renderMeasurePair(
	context,
	x,
	yTreble,
	yBass,
	music,
	measureIndex
) {
	const treble = music.treble[measureIndex] || emptyMeasure();
	const bass = music.bass[measureIndex] || emptyMeasure();
	const width = measureRenderWidth(treble, bass, TIME_SIGNATURE);
	drawVoiceMeasure(context, treble, x, yTreble, width, 'treble');
	drawVoiceMeasure(context, bass, x, yBass, width, 'bass');
	const barX = x + width;
	drawBarLine(context, barX, yTreble);
	drawBarLine(context, barX, yBass);
	return barX + 20;
}

function drawVoiceMeasure(context, measure, x, y, width, clef) {
	if (measure.beatStructure.length === 0) {
		drawRest(
			context,
			{ duration: 'whole' },
			x + width / 2,
			y
		);
		return;
	}
	drawMeasure(context, measure, x, y, 1, clef);
}
