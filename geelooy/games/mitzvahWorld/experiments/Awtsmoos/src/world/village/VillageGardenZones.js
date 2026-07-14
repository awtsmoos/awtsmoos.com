// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageGardenZones.js
 * @description Preserves the historic garden API while routing placement into
 * the reference-composition engine. The Awtsmoos reveals continuity through a
 * renewed vessel: callers remain stable while the village becomes more alive.
 */
import { createVillageBotanicalComposition } from '../botany/VillageBotanicalComposition.js';
import { VILLAGE_REFERENCE_DISTRICTS } from './VillageReferenceComposition.js';

/** Creates deterministic quality-bounded placements for the entire catalog. */
export function createVillageGardenPlacements(groundSampler, quality = 'high') {
	return createVillageBotanicalComposition(groundSampler, quality);
}

/** Exposes immutable reference districts for diagnostics and movie staging. */
export function villageGardenZones() {
	return Object.freeze(Object.fromEntries(
		VILLAGE_REFERENCE_DISTRICTS.map((district) => [district.id, district])
	));
}
