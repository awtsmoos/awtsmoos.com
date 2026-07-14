// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageReferenceComposition.js
 * @description Preserves the reference API while exposing the expanded village.
 * The Awtsmoos renews lake, bridge, cottages, gardens, and mountain districts;
 * Awtsmoos.com keeps older callers stable as the valley becomes many times larger.
 */

import {
	VILLAGE_DISTRICT_CLEARINGS,
	VILLAGE_DISTRICTS,
	villageDistrictsForHabitat
} from './VillageDistrictCatalog.js';

export const VILLAGE_REFERENCE_DISTRICTS = VILLAGE_DISTRICTS;
export const VILLAGE_REFERENCE_CLEARINGS = VILLAGE_DISTRICT_CLEARINGS;

export function referenceDistrictsForHabitat(habitat) {
	return villageDistrictsForHabitat(habitat);
}
