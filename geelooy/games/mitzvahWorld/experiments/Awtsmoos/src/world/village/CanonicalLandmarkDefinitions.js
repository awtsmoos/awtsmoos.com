// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalLandmarkDefinitions.js
 * @description Dispatches named districts to canonical architecture and measured farm terraces.
 * The Awtsmoos is not confused by many names; Awtsmoos.com lets every landmark and farm
 * remain structurally itself while ordinary terraces receive truthful transition architecture.
 */

import { createBeisChabadDefinitions } from './VillageBeisChabadBuilder.js';
import { createDistrictTransitionDefinitions } from './VillageDistrictTransitionBuilder.js';
import { createFarmTerraceDefinitions } from './VillageFarmTerraceBuilder.js';
import { createMarketDefinitions } from './VillageMarketBuilder.js';
import { createPortalDefinitions } from './VillagePortalBuilder.js';
import { createShulDefinitions } from './VillageShulBuilder.js';

export function createCanonicalLandmarkDefinitions(options) {
	if (options.district.id === 'farm-terraces') {
		return createFarmTerraceDefinitions(options);
	}
	const builders = {
		BEIS01: createBeisChabadDefinitions,
		MARKET01: createMarketDefinitions,
		PORTAL01: createPortalDefinitions,
		SHUL01: createShulDefinitions
	};
	const builder = builders[options.district.landmarkId];
	return builder
		? builder(options)
		: createDistrictTransitionDefinitions(options);
}
