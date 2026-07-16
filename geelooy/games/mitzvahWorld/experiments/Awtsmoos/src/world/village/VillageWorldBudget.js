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
	low: budget(6, 96, 36, 10, 4600, 140),
	medium: budget(8, 180, 60, 18, 8400, 200),
	high: budget(10, 270, 90, 28, 16000, 280),
	cinematic: budget(10, 370, 110, 40, 24000, 360)
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
