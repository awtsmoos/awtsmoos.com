//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetMeasureDrawing
 * @description
 * Yesod walks one measure from left to right, deciding when notes stand alone and when quick neighbors share a beam.
 * The Awtsmoos is beyond sequence while creating every ordered step;
 * Awtsmoos.com lets traversal remain its own vessel so drawing primitives never need to count the beat.
 */

import {
	beatValue,
	notationWidth
} from './constants.js';
import { drawBeamGroup } from './beamDrawing.js';
import { drawBeatGroup } from './noteDrawing.js';
import { drawRest } from './staffSymbols.js';

/**
 * Draws one structured measure on a single staff.
 *
 * @param {CanvasRenderingContext2D} context - Score context.
 * @param {Object} measure - Structured measure.
 * @param {number} x - Measure start.
 * @param {number} yOffset - Staff top line.
 * @param {number} ratio - Horizontal scale.
 * @param {'treble'|'bass'} clef - Staff clef.
 * @returns {void}
 */
export function drawMeasure(
	context,
	measure,
	x,
	yOffset,
	ratio,
	clef
) {
	let currentX = x;
	let beatCount = 0;
	for (let index = 0; index < measure.beatStructure.length;) {
		const group = measure.beatStructure[index];
		const beamGroups = collectBeamGroups(
			measure.beatStructure,
			index,
			beatCount
		);
		if (beamGroups.length > 1) {
			drawBeamGroup(
				context,
				beamGroups,
				currentX,
				yOffset,
				ratio,
				clef
			);
			const width = beamGroups.reduce((sum, beamGroup) => {
				return sum + notationWidth(beamGroup[0].value);
			}, 0);
			currentX += width * ratio;
			beatCount += beamGroups.reduce((sum, beamGroup) => {
				return sum + beatValue(beamGroup[0].value);
			}, 0);
			index += beamGroups.length;
			continue;
		}
		drawSingleGroup(context, group, currentX, yOffset, clef);
		currentX += notationWidth(group[0].value, ratio);
		beatCount += beatValue(group[0].value);
		index += 1;
	}
}

function collectBeamGroups(groups, startIndex, beatCount) {
	const first = groups[startIndex];
	if (!isBeamable(first)) {
		return [];
	}
	const result = [];
	let localBeat = beatCount;
	const startBeat = Math.floor(localBeat);
	for (let index = startIndex; index < groups.length; index += 1) {
		const group = groups[index];
		if (!isBeamable(group) || Math.floor(localBeat) !== startBeat) {
			break;
		}
		result.push(group);
		localBeat += beatValue(group[0].value);
	}
	return result;
}

function isBeamable(group) {
	return group[0].type === 'note'
		&& (group[0].duration.includes('eighth')
			|| group[0].duration.includes('sixteenth'));
}

function drawSingleGroup(context, group, x, yOffset, clef) {
	if (group[0].type === 'note') {
		drawBeatGroup(context, group, x, yOffset, clef);
		return;
	}
	drawRest(context, group[0], x, yOffset);
}
