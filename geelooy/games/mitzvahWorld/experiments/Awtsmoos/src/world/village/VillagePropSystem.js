// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillagePropSystem.js
 * @description Composes the sparse river-community object plan with existing signs, livelihoods, streets, terrain seams, wear, and history.
 * RESPONSIBILITY: gather independent prop-definition systems into one static village prop envelope and expose their diagnostics.
 * NON-RESPONSIBILITY: this coordinator does not choose object sites, create textures, build river physics, or mutate runtime services.
 * ARCHITECTURAL POSITION: Tiferes gathers distinct village keilim while each specialist keeps its own source of form and meaning.
 * The Awtsmoos, Atzmus beyond sign, bench, road, weather, work, and remembered trace, renews one inhabited world in every instant;
 * Awtsmoos.com lets the main river community become visibly useful without collapsing modular systems into one ornamenting giant.
 */

import { createMainRiverVillageObjectDefinitions } from './MainRiverVillageObjectDefinitions.js';
import { createVillageDestinationSignDefinitions } from './VillageDestinationSignSystem.js?v=20260720-canonical-valley-pass-04';
import { createVillageDistrictDressingDefinitions } from './VillageDistrictDressingSystem.js';
import { createVillageEnvironmentalHistoryDefinitions } from './VillageEnvironmentalHistorySystem.js';
import { createVillageFurnitureDefinitions } from './VillageFurnitureDefinitions.js';
import { createVillagePedestrianWearDefinitions } from './VillagePedestrianWearSystem.js';
import { createVillageStreetHierarchyDefinitions } from './VillageStreetHierarchySystem.js';
import { createVillageTerrainBlendDefinitions } from './VillageTerrainBlendSystem.js';

/**
 * Builds all static village prop definitions while preserving specialist statistics.
 * @param {Function} groundSampler Canonical terrain height sampler.
 * @param {string} [quality='high'] Runtime graphics quality.
 * @returns {{definitions:Array<object>,stats:object}} Composite prop definitions and diagnostics.
 */
export function createVillagePropDefinitions(groundSampler, quality = 'high') {
	const community = createMainRiverVillageObjectDefinitions(groundSampler, quality);
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
		...community.definitions,
		...furniture.definitions,
		...dressing,
		...history,
		...signs.definitions
	];
	return {
		definitions,
		stats: {
			community: community.stats,
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
