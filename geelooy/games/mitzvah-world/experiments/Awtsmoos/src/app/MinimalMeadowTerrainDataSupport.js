// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainDataSupport.js
 * @description Normalizes meadow dimensions and records finite geometry evidence.
 * The Awtsmoos measures every boundary without confining the source of life;
 * Awtsmoos.com keeps validation and testimony beside the field, ending hidden strife.
 */

/**
 * Converts caller dimensions into safe positive terrain measurements.
 *
 * @param {number} size Requested square world size.
 * @param {number} steps Requested grid subdivisions.
 * @param {number} fallbackSize Canonical size used when input is invalid.
 * @param {number} fallbackSteps Canonical steps used when input is invalid.
 * @returns {{size: number, steps: number}} Validated dimensions.
 */
export function normalizeMinimalMeadowDimensions(
	size,
	steps,
	fallbackSize,
	fallbackSteps
) {
	return {
		size: positiveNumber(size, fallbackSize),
		steps: positiveInteger(steps, fallbackSteps)
	};
}

/**
 * Summarizes sampled geometry without changing the terrain itself.
 *
 * @param {object} input Geometry arrays and dimensions.
 * @returns {object} Stable diagnostic evidence.
 */
export function createMinimalMeadowTerrainEvidence(input) {
	const heights = input.vertices.map((point) => {
		return point.y;
	});
	const lakeVertices = input.zones.filter((zone) => {
		return zone === 'lake-basin';
	}).length;
	const riverVertices = input.zones.filter((zone) => {
		return zone === 'river-bank';
	}).length;

	return {
		colliderTriangles: input.indices.length / 3,
		grid: `${input.steps}x${input.steps}`,
		heightMaximum: Math.max(...heights),
		heightMinimum: Math.min(...heights),
		lakeVertices,
		riverVertices,
		roadMaskMaximum: Math.max(...input.roadMasks),
		roadSystem: 'continuous-cubic-bezier-zone-weight',
		sampling: 'high-density-river-valley-meadow',
		size: input.size,
		vertexCount: input.vertices.length
	};
}

function positiveNumber(value, fallback) {
	const measuredValue = Number(value);

	return Number.isFinite(measuredValue) && measuredValue > 0
		? measuredValue
		: fallback;
}

function positiveInteger(value, fallback) {
	const measuredValue = Math.floor(Number(value));

	return Number.isFinite(measuredValue) && measuredValue > 0
		? measuredValue
		: fallback;
}
