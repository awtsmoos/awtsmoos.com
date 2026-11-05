// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWorldSystem.js
 * @description Builds the movement-ready village and preserves bounded living world services beside render definitions.
 * The Awtsmoos descends from ridge to river, home, road, creature, and rooted soil in one world;
 * Awtsmoos.com keeps mutable river current alive after construction while static geometry remains separately unfurled.
 */

import { createVillageCreatureDefinitions } from '../creatures/VillageCreatureSystem.js';
import { createForestEdgeDefinitions } from '../forest/ForestEdgeSystem.js';
import { createAtmosphericMountainDefinitions } from './AtmosphericMountainSystem.js?v=20260720-canonical-valley-pass-04';
import { createHeroCottageCraftDefinitions } from './HeroCottageCraftSystem.js';
import { createHeroValleyGardenDefinitions } from './HeroValleyGardenSystem.js';
import { createVillageArrivalComposition } from './VillageArrivalComposition.js';
import { createVillageDistrictArchitecture } from './VillageDistrictArchitecture.js?v=20260720-canonical-valley-pass-04';
import { createVillageEssentialLandscapeDefinitions } from './VillageEssentialLandscapeSystem.js';
import { createVillageFoundationDefinitions } from './VillageFoundationSystem.js';
import { createVillageHouseBubbleDefinitions } from './VillageHouseBubbleSystem.js';
import { createVillageLifeContracts } from './VillageLifeSystem.js';
import { createVillagePracticalLightDefinitions } from './VillagePracticalLightSystem.js';
import { createVillagePropDefinitions } from './VillagePropSystem.js?v=20260720-canonical-valley-pass-04';
import { createVillageWaterDefinitions } from './VillageWaterSystem.js?v=20260720-canonical-valley-pass-04';
import { createVillageWorldServices } from './VillageWorldServices.js';
import { villageWorldBudget } from './VillageWorldBudget.js';
import { VILLAGE_WORLD_LAYERS } from './VillageWorldLayers.js';

export function createVillageWorldDefinitions(groundSampler, quality = 'high') {
	const systems = createSystems(groundSampler, quality);
	const definitions = flattenSystems(systems);
	return {
		definitions,
		services: createVillageWorldServices(systems),
		stats: createStats(systems, definitions, quality)
	};
}

function createSystems(groundSampler, quality) {
	const architecture = createVillageDistrictArchitecture(groundSampler, quality);
	return {
		architecture,
		arrival: createVillageArrivalComposition(groundSampler),
		budget: villageWorldBudget(quality),
		cottageCraft: createHeroCottageCraftDefinitions(groundSampler),
		creatures: createVillageCreatureDefinitions(groundSampler, quality),
		forestEdge: createForestEdgeDefinitions(groundSampler, quality),
		foundations: createVillageFoundationDefinitions(architecture, groundSampler),
		heroGardens: createHeroValleyGardenDefinitions(groundSampler),
		houseBubbles: createVillageHouseBubbleDefinitions(groundSampler, quality),
		landscape: createVillageEssentialLandscapeDefinitions(groundSampler, quality),
		life: createVillageLifeContracts(quality),
		mountains: createAtmosphericMountainDefinitions(quality),
		population: emptyAnimatedPopulation(),
		practicalLights: createVillagePracticalLightDefinitions(groundSampler, quality),
		props: createVillagePropDefinitions(groundSampler, quality),
		water: createVillageWaterDefinitions(groundSampler)
	};
}

function flattenSystems(systems) {
	return [
		...systems.mountains,
		...systems.water.definitions,
		...systems.props.definitions,
		...systems.arrival,
		...systems.foundations,
		...systems.architecture,
		...systems.houseBubbles,
		...systems.practicalLights,
		...systems.landscape.definitions,
		...systems.cottageCraft,
		...systems.heroGardens,
		...systems.forestEdge,
		...systems.population,
		...systems.creatures
	];
}

function createStats(s, definitions, quality) {
	return {
		architecture: s.architecture.stats,
		arrival: s.arrival.stats,
		botanicalEnrichment: 'deferred-after-movement',
		budget: s.budget,
		creatures: s.creatures.stats,
		definitionCount: definitions.length,
		forestEdge: s.forestEdge.stats,
		foundations: s.foundations.stats,
		heroCraftDefinitions: s.cottageCraft.length,
		heroGardenDefinitions: s.heroGardens.length,
		houseBubbles: s.houseBubbles.stats,
		landscape: s.landscape.stats,
		layers: VILLAGE_WORLD_LAYERS,
		life: s.life.stats,
		mountains: s.mountains.stats,
		name: 'Reference golden-hour Awtsmoos mountain village',
		population: s.population.stats,
		practicalLights: s.practicalLights.stats,
		props: s.props.stats,
		quality,
		water: s.water.stats
	};
}

function emptyAnimatedPopulation() {
	return Object.assign([], {
		stats: {
			definitions: 0,
			people: 0,
			realtimeAnimations: 'skeletal-chossid.glb-runtime-population',
			visualPolicy: 'no-primitive-humans'
		}
	});
}

export default createVillageWorldDefinitions;
