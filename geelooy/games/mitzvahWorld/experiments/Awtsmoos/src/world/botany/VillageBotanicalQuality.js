// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalQuality.js
 * @description Holds measured garden budgets for deterministic district composition and richer silhouettes.
 * The Awtsmoos renews abundance without hidden discarded work; Awtsmoos.com names every featured bed,
 * repeated mass, geometry tier, cluster, placement, and triangle before generation begins.
 */

export const VILLAGE_BOTANICAL_QUALITY = Object.freeze({
	low: policy(0.42, 9, 0, 72, 5600, 'low', 'low'),
	medium: policy(1, 21, 0, 144, 11200, 'low', 'low'),
	high: policy(1, 24, 79, 226, 28000, 'medium', 'low'),
	cinematic: policy(1, 24, 153, 300, 56000, 'high', 'medium')
});

export function villageBotanicalQuality(name = 'high') {
	return VILLAGE_BOTANICAL_QUALITY[name] || VILLAGE_BOTANICAL_QUALITY.high;
}

function policy(
	speciesFraction,
	featuredBudget,
	repeatBudget,
	maxPlacements,
	maxTriangles,
	geometryQuality,
	repeatQuality
) {
	return Object.freeze({
		featuredBudget,
		geometryQuality,
		maxClusterCount: 2,
		maxPlacements,
		maxTriangles,
		repeatBudget,
		repeatQuality,
		speciesFraction
	});
}
