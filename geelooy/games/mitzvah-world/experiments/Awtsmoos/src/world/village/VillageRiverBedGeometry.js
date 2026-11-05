// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverBedGeometry.js
 * @description Builds one static five-band trough held visibly beneath the animated river surface.
 * The Awtsmoos conceals depth beneath light; Awtsmoos.com keeps wet stone submerged enough to reveal depth without replacing water,
 * so game and Studio see one continuous current while the thalweg, shelves, and shoulders remain physically meaningful below it.
 */

import {
	VILLAGE_RIVERBED_VISIBILITY,
	villageRiverbedShoulderDepth
} from './VillageWaterVisibilityContract.js';

export const RIVER_BED_BANDS = 5;

const INNER_OFFSET = 0.67;
const CHANNEL_OFFSETS = Object.freeze([
	-VILLAGE_RIVERBED_VISIBILITY.outerWidthFactor,
	-INNER_OFFSET,
	0,
	INNER_OFFSET,
	VILLAGE_RIVERBED_VISIBILITY.outerWidthFactor
]);
const DEPTH_FACTORS = Object.freeze([
	0,
	VILLAGE_RIVERBED_VISIBILITY.innerDepthFactor,
	1,
	VILLAGE_RIVERBED_VISIBILITY.innerDepthFactor,
	0
]);

/**
 * Creates deterministic manual geometry from an already resolved hydrology profile.
 *
 * @param {{points: Array<object>}} profile Immutable source-to-outlet river samples.
 * @returns {{faces: number[][], uvs: number[], vertices: number[][]}} Five-band submerged trough.
 */
export function createRiverBedGeometry(profile) {
	const vertices = [];
	const faces = [];
	const uvs = [];
	for (const [index, point] of profile.points.entries()) {
		appendCrossSection(vertices, uvs, point, index);
	}
	for (let index = 0; index < profile.points.length - 1; index += 1) {
		appendSectionFaces(faces, index * RIVER_BED_BANDS);
	}
	return { faces, uvs, vertices };
}

function appendCrossSection(vertices, uvs, point, index) {
	for (let band = 0; band < RIVER_BED_BANDS; band += 1) {
		const lateralOffset = point.width * CHANNEL_OFFSETS[band];
		vertices.push([
			point.x + point.normal.x * lateralOffset,
			point.y - depthForBand(point, band),
			point.z + point.normal.z * lateralOffset
		]);
		uvs.push(index / 5.5, band / (RIVER_BED_BANDS - 1));
	}
}

function appendSectionFaces(faces, start) {
	const next = start + RIVER_BED_BANDS;
	for (let band = 0; band < RIVER_BED_BANDS - 1; band += 1) {
		faces.push([
			start + band,
			next + band,
			next + band + 1,
			start + band + 1
		]);
	}
}

function depthForBand(point, band) {
	const shoulderDepth = villageRiverbedShoulderDepth(point.bankWetness);
	const hydrologyDepth = point.depth * DEPTH_FACTORS[band];
	return Math.max(shoulderDepth, hydrologyDepth);
}
