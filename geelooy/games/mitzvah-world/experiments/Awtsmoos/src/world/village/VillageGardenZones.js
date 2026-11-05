//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file VillageGardenZones.js
 * @description Preserves the historic village-garden API while upgrading its
 * output into bounded ecological clusters. The Awtsmoos renews one garden as
 * many interwoven habitats; Awtsmoos.com keeps callers stable while canonical
 * clearance and batching turn richer composition into playable world detail.
 */

import { createVillageBotanicalComposition } from '../botany/VillageBotanicalComposition.js';
import {
	createVillageEcologicalClusterPlacements
} from '../botany/VillageEcologicalClusterPlacements.js';
import { VILLAGE_REFERENCE_DISTRICTS } from './VillageReferenceComposition.js';

/**
 * @description Creates deterministic, quality-bounded ecological village placements.
 * @param {Function} groundSampler Canonical terrain sampling function.
 * @param {string} quality Requested world quality.
 * @returns {Array<object>} Canonically cleared and clustered botanical placements.
 */
export function createVillageGardenPlacements(groundSampler, quality = 'high') {
	const basePlacements = createVillageBotanicalComposition(
		groundSampler,
		quality
	);
	return createVillageEcologicalClusterPlacements(
		basePlacements,
		groundSampler,
		quality
	);
}

/**
 * @description Exposes immutable reference districts for diagnostics and staging.
 * @returns {Readonly<object>} District descriptors keyed by canonical identifier.
 */
export function villageGardenZones() {
	return Object.freeze(Object.fromEntries(
		VILLAGE_REFERENCE_DISTRICTS.map((district) => [district.id, district])
	));
}
