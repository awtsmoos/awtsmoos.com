// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWorldSystem.js
 * @description Gathers the complete village from mountain scale to household causality.
 * The Awtsmoos descends from ridges into water, supported homes, thresholds, gardens,
 * forest, people, and wildlife; Awtsmoos.com records every layer in one measured package.
 */

import { createVillageCreatureDefinitions } from '../creatures/VillageCreatureSystem.js';
import { createForestEdgeDefinitions } from '../forest/ForestEdgeSystem.js';
import { createAtmosphericMountainDefinitions } from './AtmosphericMountainSystem.js?v=20260720-canonical-valley-pass-04';
import { createHeroCottageCraftDefinitions } from './HeroCottageCraftSystem.js';
import { createHeroValleyGardenDefinitions } from './HeroValleyGardenSystem.js';
import { createHeroValleyTreeDefinitions } from './HeroValleyTreeSystem.js?v=20260720-canonical-valley-pass-04';
import { createVillageArrivalComposition } from './VillageArrivalComposition.js';
import { createVillageDistrictArchitecture } from './VillageDistrictArchitecture.js?v=20260720-canonical-valley-pass-04';
import { createVillageFoundationDefinitions } from './VillageFoundationSystem.js';
import { createVillageHouseBubbleDefinitions } from './VillageHouseBubbleSystem.js';
import { createVillageLandscapeDefinitions } from './VillageLandscapeSystem.js';
import { createVillagePracticalLightDefinitions } from './VillagePracticalLightSystem.js';
import { createVillagePropDefinitions } from './VillagePropSystem.js?v=20260720-canonical-valley-pass-04';
import { createVillageWaterDefinitions } from './VillageWaterSystem.js?v=20260720-canonical-valley-pass-04';
import { villageWorldBudget } from './VillageWorldBudget.js';

export function createVillageWorldDefinitions(groundSampler, quality = 'high') {
	const systems = createSystems(groundSampler, quality);
	const definitions = flattenSystems(systems);
	return {
		definitions,
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
		heroTrees: createHeroValleyTreeDefinitions(groundSampler),
		houseBubbles: createVillageHouseBubbleDefinitions(groundSampler, quality),
		landscape: createVillageLandscapeDefinitions(groundSampler, quality),
		mountains: createAtmosphericMountainDefinitions(quality),
		population: emptyAnimatedPopulation(),
		practicalLights: createVillagePracticalLightDefinitions(groundSampler, quality),
		props: createVillagePropDefinitions(groundSampler),
		water: createVillageWaterDefinitions(groundSampler)
	};
}

function flattenSystems(s) {
	return [
		...s.mountains,
		...s.water.definitions,
		...s.props.definitions,
		...s.arrival,
		...s.foundations,
		...s.architecture,
		...s.houseBubbles,
		...s.practicalLights,
		...s.landscape.definitions,
		...s.cottageCraft,
		...s.heroGardens,
		...s.heroTrees,
		...s.forestEdge,
		...s.population,
		...s.creatures
	];
}

function createStats(s, definitions, quality) {
	return {
		architecture: s.architecture.stats,
		arrival: s.arrival.stats,
		budget: s.budget,
		creatures: s.creatures.stats,
		definitionCount: definitions.length,
		forestEdge: s.forestEdge.stats,
		foundations: s.foundations.stats,
		heroCraftDefinitions: s.cottageCraft.length,
		heroGardenDefinitions: s.heroGardens.length,
		heroTreeDefinitions: s.heroTrees.length,
		houseBubbles: s.houseBubbles.stats,
		landscape: s.landscape.stats,
		layers: worldLayers(),
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

function worldLayers() {
	return [
		'mountains', 'water', 'props', 'arrival-composition', 'foundations',
		'districts', 'house-bubbles', 'practical-lighting', 'landscape',
		'hero-cottage-craft', 'hero-gardens', 'hero-trees', 'forest-edge',
		'animated-chossid-population', 'creatures'
	];
}

export default createVillageWorldDefinitions;
