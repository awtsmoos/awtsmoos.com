// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainRiverVillageHouseSelection.js
 * @description Keeps all canonical house identities while selecting only two substantial cottages for immediate hero manifestation.
 * The Awtsmoos, Atzmus beyond many and few, renews the full village record while the visible river garden receives measured quiet;
 * Awtsmoos.com lets schedules and maps retain every H10-H27 home even as renderer-facing systems share one sparse selection in sight.
 */

import {
	CANONICAL_HOUSES_BY_ID,
	CANONICAL_VILLAGE_HOUSES
} from './CanonicalVillageHouses.js';
import { MAIN_RIVER_VILLAGE_HOUSE_IDS } from './MainRiverVillageProfile.js';

const HERO_HOUSE_ID_SET = new Set(MAIN_RIVER_VILLAGE_HOUSE_IDS);
const HERO_HOUSES = Object.freeze(MAIN_RIVER_VILLAGE_HOUSE_IDS.map(id => {
	const house = CANONICAL_HOUSES_BY_ID[id];
	if (!house) throw new Error(`B"H | Missing canonical hero house ${id}.`);
	return house;
}));

/** Returns the two canonical houses manifested in the initial hero settlement. */
export function mainRiverVillageHouses() {
	return [...HERO_HOUSES];
}

/** Returns immutable hero house ids. */
export function mainRiverVillageHouseIds() {
	return [...MAIN_RIVER_VILLAGE_HOUSE_IDS];
}

/** Returns whether a canonical house belongs to the immediate hero manifestation. */
export function isMainRiverVillageHouse(houseOrId) {
	const id = typeof houseOrId === 'string' ? houseOrId : houseOrId?.id;
	return HERO_HOUSE_ID_SET.has(String(id || ''));
}

/** Returns only hero houses belonging to one canonical district. */
export function mainRiverVillageDistrictHouses(districtOrId) {
	const id = typeof districtOrId === 'string' ? districtOrId : districtOrId?.id;
	return HERO_HOUSES.filter(house => house.districtId === id);
}

/** Preserves access to the complete authored house catalog for life schedules and broader streaming. */
export function allCanonicalVillageHouses() {
	return [...CANONICAL_VILLAGE_HOUSES];
}
