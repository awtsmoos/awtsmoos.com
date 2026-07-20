// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWorldSystem.js
 * @description Gathers the complete village and explicit canonical foundation layer.
 * The Awtsmoos descends from distant ridges into water, supported homes, lamps, gardens,
 * forest, people, and wildlife; Awtsmoos.com records every layer in one measured world package.
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
import { createVillageLandscapeDefinitions } from './VillageLandscapeSystem.js';
import { createVillagePracticalLightDefinitions } from './VillagePracticalLightSystem.js';
import { createVillagePropDefinitions } from './VillagePropSystem.js?v=20260720-canonical-valley-pass-04';
import { createVillageWaterDefinitions } from './VillageWaterSystem.js?v=20260720-canonical-valley-pass-04';
import { villageWorldBudget } from './VillageWorldBudget.js';

export function createVillageWorldDefinitions(groundSampler, quality = 'high') {
	const budget = villageWorldBudget(quality);
	const mountains = createAtmosphericMountainDefinitions(quality);
	const water = createVillageWaterDefinitions(groundSampler);
	const props = createVillagePropDefinitions(groundSampler);
	const arrival = createVillageArrivalComposition(groundSampler);
	const architecture = createVillageDistrictArchitecture(
		groundSampler,
		quality
	);
	const foundations = createVillageFoundationDefinitions(
		architecture,
		groundSampler
	);
	const practicalLights = createVillagePracticalLightDefinitions(
		groundSampler,
		quality
	);
	const landscape = createVillageLandscapeDefinitions(
		groundSampler,
		quality
	);
	const cottageCraft = createHeroCottageCraftDefinitions(groundSampler);
	const heroGardens = createHeroValleyGardenDefinitions(groundSampler);
	const heroTrees = createHeroValleyTreeDefinitions(groundSampler);
	const forestEdge = createForestEdgeDefinitions(groundSampler, quality);
	const population = emptyAnimatedPopulation();
	const creatures = createVillageCreatureDefinitions(groundSampler, quality);
	const definitions = [
		...mountains,
		...water.definitions,
		...props.definitions,
		...arrival,
		...foundations,
		...architecture,
		...practicalLights,
		...landscape.definitions,
		...cottageCraft,
		...heroGardens,
		...heroTrees,
		...forestEdge,
		...population,
		...creatures
	];
	return {
		definitions,
		stats: {
			architecture: architecture.stats,
			arrival: arrival.stats,
			budget,
			creatures: creatures.stats,
			definitionCount: definitions.length,
			forestEdge: forestEdge.stats,
			foundations: foundations.stats,
			heroCraftDefinitions: cottageCraft.length,
			heroGardenDefinitions: heroGardens.length,
			heroTreeDefinitions: heroTrees.length,
			landscape: landscape.stats,
			layers: worldLayers(),
			mountains: mountains.stats,
			name: 'Reference golden-hour Awtsmoos mountain village',
			population: population.stats,
			practicalLights: practicalLights.stats,
			props: props.stats,
			quality,
			water: water.stats
		}
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
		'mountains',
		'water',
		'props',
		'arrival-composition',
		'foundations',
		'districts',
		'practical-lighting',
		'landscape',
		'hero-cottage-craft',
		'hero-gardens',
		'hero-trees',
		'forest-edge',
		'animated-chossid-population',
		'creatures'
	];
}

export default createVillageWorldDefinitions;
