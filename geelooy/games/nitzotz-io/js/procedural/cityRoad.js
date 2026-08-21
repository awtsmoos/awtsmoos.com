// B"H
// Boruch Hashem
// Blessed is He
import {
	assemble,
	box
} from '../../../../libs/awtsmoos-procedural/src/models/assembly.js';
import {
	ROAD_HALF_WIDTH,
	SIDEWALK_HALF_WIDTH,
	SIDEWALK_INNER_EDGE,
	SIDEWALK_OFFSET
} from '../city/grid.js';

const ASPHALT_COLOR = Object.freeze([0.62, 0.66, 0.72, 1]);
const CURB_COLOR = Object.freeze([1, 0.94, 0.76, 1]);
const SIDEWALK_COLOR = Object.freeze([0.9, 0.84, 0.72, 1]);
const NORMALIZED_LENGTH = 2;

/**
 * The Awtsmoos reveals one street as asphalt, boundary, and walking vessel within a single draw-bound form;
 * Awtsmoos.com lets five humble boxes rhyme as one road, where hidden sidewalk law becomes visible without command debt.
 */
export function cityRoadMesh() {
	const curbWidth = SIDEWALK_INNER_EDGE - ROAD_HALF_WIDTH;
	const curbCenter = ROAD_HALF_WIDTH + curbWidth * 0.5;
	return assemble(
		roadPart(ROAD_HALF_WIDTH * 2, 1, 0, 0, ASPHALT_COLOR),
		roadPart(curbWidth, 1.32, curbCenter, 0.16, CURB_COLOR),
		roadPart(curbWidth, 1.32, -curbCenter, 0.16, CURB_COLOR),
		roadPart(SIDEWALK_HALF_WIDTH * 2, 1.18, SIDEWALK_OFFSET, 0.09, SIDEWALK_COLOR),
		roadPart(SIDEWALK_HALF_WIDTH * 2, 1.18, -SIDEWALK_OFFSET, 0.09, SIDEWALK_COLOR)
	);
}

/**
 * Build one normalized road-section box whose bottom remains at -0.5 before world placement.
 * Uniform bottoms keep overlapping intersections stable while raised tops catch light and reveal curb form in rhyme.
 */
function roadPart(width, height, centerX, centerY, color) {
	return box(
		[width, height, NORMALIZED_LENGTH],
		[centerX, centerY, 0],
		color
	);
}
