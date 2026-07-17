// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWorldBudget.js
 * @description Holds full-scene quality budgets without deleting canonical districts.
 * The Awtsmoos renews the same village through every vessel; Awtsmoos.com lowers repeated
 * detail and ecology density while all ten authored districts remain present and identifiable.
 */

export const VILLAGE_WORLD_BUDGETS = Object.freeze({
	low: budget(10, 96, 90, 10, 9000, 140),
	medium: budget(10, 180, 150, 18, 18000, 200),
	high: budget(10, 270, 240, 28, 36000, 280),
	cinematic: budget(10, 370, 340, 40, 56000, 360)
});

/**
 * Returns the immutable budget for a named quality tier.
 *
 * @param {string} [name='high'] Requested quality tier.
 * @returns {Readonly<object>} The matching world budget.
 */
export function villageWorldBudget(name = 'high') {
	return VILLAGE_WORLD_BUDGETS[name] || VILLAGE_WORLD_BUDGETS.high;
}

/**
 * Resolves geometry detail while preserving district identity.
 *
 * @param {string} detail District distance class.
 * @param {string} [requestedQuality='high'] Requested quality tier.
 * @returns {string} Geometry quality name.
 */
export function districtGeometryQuality(detail, requestedQuality = 'high') {
	if (requestedQuality === 'low') {
		return 'low';
	}
	if (detail === 'far') {
		return 'low';
	}
	if (detail === 'medium') {
		return requestedQuality === 'cinematic' ? 'medium' : 'low';
	}
	return requestedQuality === 'cinematic' ? 'high' : requestedQuality;
}

/**
 * Creates one frozen budget record.
 *
 * @param {number} districts Canonical district count.
 * @param {number} botanicalPlacements Botanical placement ceiling.
 * @param {number} architecturePieces Architecture definition ceiling.
 * @param {number} creatures Creature ceiling.
 * @param {number} triangles Triangle target.
 * @param {number} radius Active world radius.
 * @returns {Readonly<object>} Frozen budget record.
 */
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
