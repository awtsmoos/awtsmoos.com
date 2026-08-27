// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainRiverVillageProfile.js
 * @description Names the sparse lower-river hero settlement and its bounded quality budgets without duplicating canonical geography.
 * RESPONSIBILITY: provide stable hero-slice identity plus explicit structure, texture, NPC, and object budgets by quality tier.
 * NON-RESPONSIBILITY: this file does not select texture URLs, place objects, build houses, or mutate runtime quality.
 * ARCHITECTURAL POSITION: Chochmah states a small village intention while specialist keilim turn those budgets into visible world evidence.
 * The Awtsmoos, Atzmus beyond crowded and empty, renews one valley where a few meaningful forms may reveal more than repeated shells;
 * Awtsmoos.com lets this profile hold simple budgets while houses, water, materials, NPCs, and gameplay remain truthful specialist wells.
 */

export const MAIN_RIVER_VILLAGE_ID = 'lower-river-garden-community';
export const MAIN_RIVER_VILLAGE_LOCATION_ID = 'river-garden';
export const MAIN_RIVER_VILLAGE_HOUSE_IDS = Object.freeze(['H27', 'H10']);

const QUALITY_BUDGETS = Object.freeze({
	cinematic: budget(2, 6, 7, 16),
	high: budget(2, 5, 7, 14),
	medium: budget(2, 4, 4, 10),
	low: budget(2, 3, 3, 7)
});

/**
 * Returns immutable hero-village budgets for one graphics quality.
 * @param {string} [quality='medium'] Runtime graphics quality.
 * @returns {Readonly<object>} Structure, texture, NPC, and object budgets.
 */
export function mainRiverVillageBudget(quality = 'medium') {
	return QUALITY_BUDGETS[quality] || QUALITY_BUDGETS.medium;
}

function budget(structures, textureLayers, npcs, objects) {
	return Object.freeze({
		npcs,
		objects,
		structures,
		textureLayers
	});
}
