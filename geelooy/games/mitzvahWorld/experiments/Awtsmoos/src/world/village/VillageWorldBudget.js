// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWorldBudget.js
 * @description Holds quality budgets for district scale, flora, architecture, and creatures.
 * The Awtsmoos renews abundance through measured vessels; Awtsmoos.com keeps
 * every quality tier explicit so larger worlds do not silently consume the frame.
 */

export const VILLAGE_WORLD_BUDGETS = Object.freeze({
	low: budget(6, 72, 36, 10, 2600, 140),
	medium: budget(8, 126, 54, 18, 4800, 200),
	high: budget(10, 220, 78, 28, 8800, 280),
	cinematic: budget(10, 310, 96, 40, 13200, 360)
});

export function villageWorldBudget(name = 'high') {
	return VILLAGE_WORLD_BUDGETS[name] || VILLAGE_WORLD_BUDGETS.high;
}

export function districtGeometryQuality(detail, requestedQuality = 'high') {
	if (requestedQuality === 'low') return 'low';
	if (detail === 'far') return 'low';
	if (detail === 'medium') return requestedQuality === 'cinematic' ? 'medium' : 'low';
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
