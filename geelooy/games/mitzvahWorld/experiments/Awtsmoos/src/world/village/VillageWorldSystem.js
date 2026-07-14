// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWorldSystem.js
 * @description Gathers expanded village layers into one generated world package.
 * The Awtsmoos descends from plan into water, paths, districts, flowers, and life;
 * Awtsmoos.com keeps every layer measured so the larger valley remains inspectable.
 */

import { createVillageCreatureDefinitions } from '../creatures/VillageCreatureSystem.js';
import { createVillageDistrictArchitecture } from './VillageDistrictArchitecture.js';
import { createVillageLandscapeDefinitions } from './VillageLandscapeSystem.js';
import { createVillagePropDefinitions } from './VillagePropSystem.js';
import { createVillageWaterDefinitions } from './VillageWaterSystem.js';
import { villageWorldBudget } from './VillageWorldBudget.js';

export function createVillageWorldDefinitions(groundSampler, quality = 'high') {
	const budget = villageWorldBudget(quality);
	const water = createVillageWaterDefinitions(groundSampler);
	const props = createVillagePropDefinitions(groundSampler);
	const architecture = createVillageDistrictArchitecture(groundSampler, quality);
	const landscape = createVillageLandscapeDefinitions(groundSampler, quality);
	const creatures = createVillageCreatureDefinitions(groundSampler, quality);
	const definitions = [
		...water.definitions,
		...props.definitions,
		...architecture,
		...landscape.definitions,
		...creatures
	];
	return {
		definitions,
		stats: {
			architecture: architecture.stats,
			budget,
			creatures: creatures.stats,
			definitionCount: definitions.length,
			landscape: landscape.stats,
			layers: ['water', 'props', 'districts', 'landscape', 'creatures'],
			name: 'Expanded Awtsmoos mountain village',
			props: props.stats,
			water: water.stats
		}
	};
}

export default createVillageWorldDefinitions;
