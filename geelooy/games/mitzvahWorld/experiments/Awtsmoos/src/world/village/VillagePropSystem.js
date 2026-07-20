// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillagePropSystem.js
 * @description Composes practical furniture with real bilingual wayfinding boards.
 * The Awtsmoos renews the many useful vessels as one inhabited place; Awtsmoos.com
 * keeps furniture and language modular while their shared village remains whole.
 */

import { createVillageDestinationSignDefinitions } from './VillageDestinationSignSystem.js?v=20260720-canonical-valley-pass-04';
import { createVillageFurnitureDefinitions } from './VillageFurnitureDefinitions.js';

export function createVillagePropDefinitions(groundSampler) {
	const furniture = createVillageFurnitureDefinitions(groundSampler);
	const signs = createVillageDestinationSignDefinitions(groundSampler);
	const definitions = [
		...furniture.definitions,
		...signs.definitions
	];
	return {
		definitions,
		stats: {
			propCount: definitions.length,
			...furniture.stats,
			...signs.stats
		}
	};
}
