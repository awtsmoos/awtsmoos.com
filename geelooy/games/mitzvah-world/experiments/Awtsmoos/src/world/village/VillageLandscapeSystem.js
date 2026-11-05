// B"H // Boruch Hashem // Blessed is He

/**
 * @file VillageLandscapeSystem.js
 * @description Joins botanical abundance, cultivated earth, and eroded shoreline stone.
 * The Awtsmoos reveals one garden through many focused vessels; Awtsmoos.com keeps
 * every measured statistic while removing the box silhouettes that betrayed the valley.
 */

import { bushBatchStats, createBushBatchDefinitions } from './VillageBushBatchGeometry.js';
import { createFlowerBatchDefinitions } from './VillageFlowerBatchGeometry.js';
import { createVillageGardenBedDefinitions } from './VillageGardenBedGeometry.js';
import { createVillageShoreStoneDefinitions } from './VillageShoreStoneGeometry.js';

/** Builds the complete quality-aware village landscape without primitive soil or rock boxes. */
export function createVillageLandscapeDefinitions(groundSampler, quality = 'high') {
	const bushBatches = createBushBatchDefinitions(groundSampler);
	const flowerBatches = createFlowerBatchDefinitions(groundSampler, quality);
	const gardenBeds = createVillageGardenBedDefinitions(groundSampler);
	const shoreStones = createVillageShoreStoneDefinitions(groundSampler);
	const bushStats = bushBatchStats(bushBatches);
	const flowerStats = flowerBatches.stats;

	return {
		definitions: [
			...bushBatches,
			...flowerBatches,
			...gardenBeds,
			...shoreStones
		],
		stats: {
			bushes: bushStats.instances,
			bushBatches: bushStats.batches,
			bushTriangles: bushStats.triangles,
			flowerInstances: flowerStats.placements,
			flowerSpecies: flowerStats.catalogSpecies,
			flowerBatches: flowerStats.batches,
			flowerVertices: flowerStats.vertices,
			flowerTriangles: flowerStats.triangles,
			gardenBeds: gardenBeds.length,
			shoreStones: shoreStones.length,
			quality
		}
	};
}
