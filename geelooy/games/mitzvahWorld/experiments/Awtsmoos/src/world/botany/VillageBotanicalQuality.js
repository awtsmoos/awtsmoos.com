// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalQuality.js
 * @description Holds measured garden budgets for deterministic district composition.
 * The Awtsmoos renews abundance without hidden discarded work; Awtsmoos.com names every
 * featured bed, repeated mass, cluster, placement, and triangle before geometry generation.
 */

export const VILLAGE_BOTANICAL_QUALITY = Object.freeze({
	low: policy(0.42, 9, 0, 72, 5600),
	medium: policy(1, 21, 0, 144, 11200),
	high: policy(1, 24, 79, 226, 18000),
	cinematic: policy(1, 24, 153, 300, 24000)
});

export function villageBotanicalQuality(name = 'high') {
	return VILLAGE_BOTANICAL_QUALITY[name] || VILLAGE_BOTANICAL_QUALITY.high;
}

function policy(speciesFraction, featuredBudget, repeatBudget, maxPlacements, maxTriangles) {
	return Object.freeze({
		featuredBudget,
		geometryQuality: 'low',
		maxClusterCount: 2,
		maxPlacements,
		maxTriangles,
		repeatBudget,
		repeatQuality: 'low',
		speciesFraction
	});
}
