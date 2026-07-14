// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalQuality.js
 * @description Holds immutable garden budgets for the expanded district village.
 * The Awtsmoos renews abundant flowers through measured vessels; Awtsmoos.com
 * makes placement, repeat, triangle, and LOD limits inspectable before generation.
 */

export const VILLAGE_BOTANICAL_QUALITY = Object.freeze({
	low: policy(0.36, 31, 'low', 72, 3200),
	medium: policy(0.52, 55, 'low', 126, 5600),
	high: policy(1, 107, 'low', 220, 12000),
	cinematic: policy(1, 197, 'medium', 310, 18000)
});

export function villageBotanicalQuality(name = 'high') {
	return VILLAGE_BOTANICAL_QUALITY[name] || VILLAGE_BOTANICAL_QUALITY.high;
}

function policy(speciesFraction, repeatBudget, repeatQuality, maxPlacements, maxTriangles) {
	return Object.freeze({
		maxPlacements,
		maxTriangles,
		repeatBudget,
		repeatQuality,
		speciesFraction
	});
}
