//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetLayout
 * @description
 * Binah measures every bar before ink touches canvas, packing systems without letting one measure crowd another.
 * The Awtsmoos is beyond width and boundary while recreating both anew;
 * Awtsmoos.com lets page geometry remain pure so rendering can follow a measured and testable view.
 */

import {
	notationWidth,
	SCORE_CONFIG,
	TIME_SIGNATURE
} from './constants.js';

const FIRST_LINE_RESERVE = 180;

/** @returns {{beatStructure:Object[][]}} Empty display measure used when one staff has no matching bar. */
export function emptyMeasure() {
	return {
		beatStructure: []
	};
}

/**
 * Calculates the visible width of one measure pair.
 *
 * @param {Object} trebleMeasure - Treble structure.
 * @param {Object} bassMeasure - Bass structure.
 * @param {Object} [timeSignature=TIME_SIGNATURE] - Meter definition.
 * @returns {number} Width in canvas pixels.
 */
export function measureRenderWidth(
	trebleMeasure,
	bassMeasure,
	timeSignature = TIME_SIGNATURE
) {
	const minimumWidth = timeSignature.beats
		* SCORE_CONFIG.BASE_NOTE_SPACING
		* 4
		* 0.7;
	return Math.max(
		measureNaturalWidth(trebleMeasure),
		measureNaturalWidth(bassMeasure),
		minimumWidth
	);
}

/**
 * Packs grand-staff measures into score systems using the legacy page-width policy.
 *
 * @param {{treble:Object[], bass:Object[]}} music - Structured grand staff.
 * @param {Object} [timeSignature=TIME_SIGNATURE] - Meter definition.
 * @returns {{lines:Object[], totalMeasures:number}} Page layout.
 */
export function createScoreLayout(music, timeSignature = TIME_SIGNATURE) {
	const totalMeasures = Math.max(
		music.treble.length,
		music.bass.length
	);
	const drawableWidth = SCORE_CONFIG.PAGE_WIDTH
		- SCORE_CONFIG.STAFF_LEFT_MARGIN
		- SCORE_CONFIG.STAFF_RIGHT_MARGIN;
	const lines = [];
	let currentLine = createLine();

	for (let index = 0; index < totalMeasures; index += 1) {
		const treble = music.treble[index] || emptyMeasure();
		const bass = music.bass[index] || emptyMeasure();
		const width = measureRenderWidth(treble, bass, timeSignature);
		const reserve = currentLine.width === 0 ? FIRST_LINE_RESERVE : 0;
		if (currentLine.measureIndices.length > 0
			&& currentLine.width + width + reserve > drawableWidth) {
			lines.push(currentLine);
			currentLine = createLine();
		}
		currentLine.measureIndices.push(index);
		currentLine.width += width;
	}
	if (currentLine.measureIndices.length > 0) {
		lines.push(currentLine);
	}
	return {
		lines,
		totalMeasures
	};
}

function createLine() {
	return {
		measureIndices: [],
		width: 0
	};
}

function measureNaturalWidth(measure) {
	return measure.beatStructure.reduce((width, group) => {
		return width + notationWidth(group[0].value);
	}, 0);
}
