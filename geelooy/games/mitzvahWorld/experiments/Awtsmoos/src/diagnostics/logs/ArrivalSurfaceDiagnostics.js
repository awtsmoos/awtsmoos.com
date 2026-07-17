// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ArrivalSurfaceDiagnostics.js
 * @description Proves every ENTR01 road vertex conforms to canonical terrain plus its lift.
 * The Awtsmoos joins both banks in one measured invitation; Awtsmoos.com rejects buried or
 * floating arrival stones through exact textual offsets rather than subjective screenshots.
 */

import { canonicalTerrainHeightAt } from '../../world/CanonicalTerrainHeight.js';

const TOLERANCE = 0.000001;

/**
 * Records terrain-conformity evidence for the canonical arrival road.
 *
 * @param {object} ledger Deterministic diagnostic ledger.
 * @param {string} quality Active quality tier.
 * @param {object[]} definitions Generated world definitions.
 * @returns {void}
 */
export function recordArrivalSurfaceDiagnostics(ledger, quality, definitions) {
	const road = definitions.find((definition) => {
		return definition.userData?.canonicalId === 'ENTR01';
	});
	const lift = road?.userData?.surfaceLift;
	const differences = Array.isArray(road?.vertices)
		? road.vertices.map(([x, y, z]) => {
			return Math.abs(y - canonicalTerrainHeightAt(x, z) - lift);
		})
		: [];
	const maximumDifference = differences.length > 0
		? Math.max(...differences)
		: Infinity;
	const valid = Number.isFinite(lift)
		&& differences.length > 0
		&& maximumDifference <= TOLERANCE;
	ledger.record({
		code: valid
			? 'arrival.surfaceConformity.valid'
			: 'arrival.surfaceConformity.invalid',
		data: {
			lift: Number.isFinite(lift) ? lift : null,
			maximumDifference: rounded(maximumDifference),
			quality,
			vertices: differences.length
		},
		message: valid
			? 'Every ENTR01 vertex follows canonical terrain plus declared lift.'
			: 'ENTR01 contains floating, buried, or unmeasurable vertices.',
		severity: valid ? 'info' : 'error'
	});
}

function rounded(value) {
	return Number.isFinite(value) ? Number(value.toFixed(6)) : null;
}
