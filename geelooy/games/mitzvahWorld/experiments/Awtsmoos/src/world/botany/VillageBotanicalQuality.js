// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalQuality.js
 * @description Holds immutable garden budgets so botanical abundance remains a
 * vessel for the Awtsmoos without stealing the frame-time needed for play.
 */

export const VILLAGE_BOTANICAL_QUALITY = Object.freeze({
	low: policy(0.36, 8, 'low', 48, 1900),
	medium: policy(0.52, 14, 'low', 72, 3400),
	high: policy(1, 27, 'low', 140, 7600),
	cinematic: policy(1, 43, 'medium', 156, 9800)
});

/** Returns a known botanical quality policy with a high-quality fallback. */
export function villageBotanicalQuality(name = 'high') {
	return VILLAGE_BOTANICAL_QUALITY[name] || VILLAGE_BOTANICAL_QUALITY.high;
}

function policy(speciesFraction, repeatBudget, repeatQuality, maxPlacements, maxTriangles) {
	return Object.freeze({
		speciesFraction,
		repeatBudget,
		repeatQuality,
		maxPlacements,
		maxTriangles
	});
}
