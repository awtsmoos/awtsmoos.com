// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWorldBudget.js
 * @description Holds scene budgets that preserve ten districts and three-part inhabitable homes.
 * The Awtsmoos renews one village through every quality vessel; Awtsmoos.com lowers repeated
 * ecology and ornament while shells, interiors, roofs, and canonical district identity remain.
 */

export const VILLAGE_WORLD_BUDGETS = Object.freeze({
	low: budget(10, 96, 120, 10, 9000, 140),
	medium: budget(10, 180, 170, 18, 18000, 200),
	high: budget(10, 270, 260, 28, 36000, 280),
	cinematic: budget(10, 370, 360, 40, 56000, 360)
});

/**
 * Returns the immutable budget for a named quality tier.
 *
 * @param {string} [name='high'] Requested quality tier.
 * @returns {Readonly<object>} Matching world budget.
 */
export function villageWorldBudget(name = 'high') {
	return VILLAGE_WORLD_BUDGETS[name] || VILLAGE_WORLD_BUDGETS.high;
}

/**
 * Resolves district geometry detail without deleting authored neighborhoods.
 *
 * @param {string} detail District distance class.
 * @param {string} [requestedQuality='high'] Requested quality tier.
 * @returns {string} Geometry quality name.
 */
export function districtGeometryQuality(detail, requestedQuality = 'high') {
	if (requestedQuality === 'low') return 'low';
	if (detail === 'far') return 'low';
	if (detail === 'medium') {
		return requestedQuality === 'cinematic' ? 'medium' : 'low';
	}
	return requestedQuality === 'cinematic' ? 'high' : requestedQuality;
}

function budget(
	districts,
	botanicalPlacements,
	architecturePieces,
	creatures,
	triangles,
	radius
) {
	return Object.freeze({
		architecturePieces,
		botanicalPlacements,
		creatures,
		districts,
		radius,
		triangles
	});
}
