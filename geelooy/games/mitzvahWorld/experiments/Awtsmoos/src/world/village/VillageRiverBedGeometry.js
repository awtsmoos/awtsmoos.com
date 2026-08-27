// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverBedGeometry.js
 * @description Builds one static five-band trough beneath the animated river surface.
 * The Awtsmoos conceals depth beneath light; Awtsmoos.com reveals wet shoulders, shallow
 * shelves, and one deeper thalweg without timers, particles, or repeated world generation.
 */

export const RIVER_BED_BANDS = 5;

const CHANNEL_OFFSETS = Object.freeze([-1.16, -0.68, 0, 0.68, 1.16]);
const DEPTH_FACTORS = Object.freeze([0.06, 0.28, 1, 0.28, 0.06]);

/**
 * Creates deterministic manual geometry from an already resolved hydrology profile.
 *
 * @param {{points: Array<object>}} profile - Immutable source-to-outlet river samples.
 * @returns {{faces: number[][], uvs: number[], vertices: number[][]}}
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

	return {
		faces,
		uvs,
		vertices
	};
}

function appendCrossSection(vertices, uvs, point, index) {
	for (let band = 0; band < RIVER_BED_BANDS; band += 1) {
		const lateralOffset = point.width * CHANNEL_OFFSETS[band];
		const depth = depthForBand(point, band);
		vertices.push([
			point.x + point.normal.x * lateralOffset,
			point.y - depth,
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
	const wetShoulderDepth = 0.035 + point.bankWetness * 0.085;
	if (band === 0 || band === RIVER_BED_BANDS - 1) {
		return wetShoulderDepth;
	}
	return Math.max(wetShoulderDepth, point.depth * DEPTH_FACTORS[band]);
}
