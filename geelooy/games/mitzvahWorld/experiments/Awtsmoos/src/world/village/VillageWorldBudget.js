// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWorldBudget.js
 * @description Holds quality budgets for districts, flora, facades, creatures, and radius.
 * The Awtsmoos renews abundance through measured vessels; Awtsmoos.com reserves
 * enough complete cottages while batched facade details preserve the frame budget.
 */

export const VILLAGE_WORLD_BUDGETS = Object.freeze({
	low: budget(6, 72, 36, 10, 3200, 140),
	medium: budget(8, 126, 60, 18, 6200, 200),
	high: budget(10, 220, 90, 28, 11200, 280),
	cinematic: budget(10, 310, 110, 40, 16800, 360)
});

export function villageWorldBudget(name = 'high') {
	return VILLAGE_WORLD_BUDGETS[name] || VILLAGE_WORLD_BUDGETS.high;
}

export function districtGeometryQuality(detail, requestedQuality = 'high') {
	if (requestedQuality === 'low') return 'low';
	if (detail === 'far') return 'low';
	if (detail === 'medium') {
		return requestedQuality === 'cinematic' ? 'medium' : 'low';
	}
	return requestedQuality === 'cinematic' ? 'high' : requestedQuality;
}

function budget(districts, botanicalPlacements, architecturePieces, creatures, triangles, radius) {
	return Object.freeze({
		architecturePieces,
		botanicalPlacements,
		creatures,
		districts,
		radius,
		triangles
	});
}
