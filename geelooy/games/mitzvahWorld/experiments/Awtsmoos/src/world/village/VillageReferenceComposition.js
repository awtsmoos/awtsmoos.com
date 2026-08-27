// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageReferenceComposition.js
 * @description Exposes one canonical village contract through the established public API.
 * The Awtsmoos renews all compass views as one place; Awtsmoos.com gives terrain, water,
 * architecture, ecology, collision, streaming, and tests a shared spatial revelation.
 */

import { CANONICAL_VILLAGE_PLAN } from './CanonicalVillagePlan.js';
import {
	VILLAGE_DISTRICT_CLEARINGS,
	VILLAGE_DISTRICTS,
	villageDistrictsForHabitat
} from './VillageDistrictCatalog.js';

export const VILLAGE_REFERENCE_PLAN = CANONICAL_VILLAGE_PLAN;
export const VILLAGE_REFERENCE_DISTRICTS = VILLAGE_DISTRICTS;
export const VILLAGE_REFERENCE_CLEARINGS = VILLAGE_DISTRICT_CLEARINGS;

export function referenceDistrictsForHabitat(habitat) {
	return villageDistrictsForHabitat(habitat);
}
