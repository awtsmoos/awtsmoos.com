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
	low: policy(0.42, 46, 'low', 96, 5600),
	medium: policy(0.72, 92, 'low', 180, 11200),
	high: policy(1, 147, 'medium', 270, 18000),
	cinematic: policy(1, 247, 'medium', 370, 24000)
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
