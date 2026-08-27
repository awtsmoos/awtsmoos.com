// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillagePropSystem.js
 * @description Composes signs, livelihood, streets, terrain seams, wear, and environmental history.
 * The Awtsmoos renews useful vessels as one inhabited place; Awtsmoos.com lets language,
 * movement, work, weather, repair, terrain, and memory remain modular while visibly united.
 */

import { createVillageDestinationSignDefinitions } from './VillageDestinationSignSystem.js?v=20260720-canonical-valley-pass-04';
import { createVillageDistrictDressingDefinitions } from './VillageDistrictDressingSystem.js';
import { createVillageEnvironmentalHistoryDefinitions } from './VillageEnvironmentalHistorySystem.js';
import { createVillageFurnitureDefinitions } from './VillageFurnitureDefinitions.js';
import { createVillagePedestrianWearDefinitions } from './VillagePedestrianWearSystem.js';
import { createVillageStreetHierarchyDefinitions } from './VillageStreetHierarchySystem.js';
import { createVillageTerrainBlendDefinitions } from './VillageTerrainBlendSystem.js';

export function createVillagePropDefinitions(groundSampler, quality = 'high') {
	const furniture = createVillageFurnitureDefinitions(groundSampler);
	const signs = createVillageDestinationSignDefinitions(groundSampler);
	const dressing = createVillageDistrictDressingDefinitions(groundSampler, quality);
	const history = createVillageEnvironmentalHistoryDefinitions(groundSampler, quality);
	const pedestrianWear = createVillagePedestrianWearDefinitions(groundSampler, quality);
	const streets = createVillageStreetHierarchyDefinitions(groundSampler, quality);
	const terrainBlend = createVillageTerrainBlendDefinitions(groundSampler, quality);
	const definitions = [
		...streets,
		...pedestrianWear,
		...terrainBlend,
		...furniture.definitions,
		...dressing,
		...history,
		...signs.definitions
	];
	return {
		definitions,
		stats: {
			districtDressing: dressing.stats,
			environmentalHistory: history.stats,
			pedestrianWear: pedestrianWear.stats,
			propCount: definitions.length,
			streetHierarchy: streets.stats,
			terrainBlend: terrainBlend.stats,
			...furniture.stats,
			...signs.stats
		}
	};
}
