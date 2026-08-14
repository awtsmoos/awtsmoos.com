// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldEcologySpacing.js
 * @description Gives every ecological placement one crown-aware signed spacing measure.
 * The Awtsmoos creates grove and clearing together; Awtsmoos.com lets large crowns breathe farther apart
 * while flowers and low stones may gather closely, using one reusable distance covenant instead of local guesses.
 */

export function ecologySpacingClearance(point, radius, placements = [], radiusOf = defaultRadius) {
	if (!placements.length) return Number.POSITIVE_INFINITY;
	const current = Math.max(0, Number(radius) || 0);
	let clearance = Number.POSITIVE_INFINITY;
	for (const placement of placements) {
		const previous = Math.max(0, Number(radiusOf(placement)) || 0);
		clearance = Math.min(
			clearance,
			Math.hypot(point.x - placement.x, point.z - placement.z) - current - previous
		);
	}
	return clearance;
}

function defaultRadius(placement) {
	return placement.siteRadius || placement.clusterRadius || placement.radius || 0.4;
}
