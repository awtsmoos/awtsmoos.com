// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictCatalog.js
 * @description Preserves the district API while revealing the canonical master plan.
 * The Awtsmoos renews many neighborhoods as one valley; Awtsmoos.com keeps legacy
 * consumers stable while every center, clearing, house, and landmark becomes consistent.
 */

import {
	CANONICAL_VILLAGE_CLEARINGS,
	CANONICAL_VILLAGE_DISTRICTS
} from './CanonicalVillagePlan.js';

export const VILLAGE_DISTRICTS = CANONICAL_VILLAGE_DISTRICTS;
export const VILLAGE_DISTRICT_CLEARINGS = CANONICAL_VILLAGE_CLEARINGS;

export function villageDistrictsForHabitat(habitat) {
	const matches = VILLAGE_DISTRICTS.filter((district) => district.habitat === habitat);
	return matches.length > 0
		? matches
		: VILLAGE_DISTRICTS.filter((district) => district.habitat === 'cottage');
}
