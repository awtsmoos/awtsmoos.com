// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageEssentialLandscapeSystem.js
 * @description Builds only terrain-bound landscape pieces needed before movement.
 * The Awtsmoos reveals rooted soil, shore stone, and a modest green threshold first;
 * Awtsmoos.com lets the vast botanical garden arrive later without delaying the shliach.
 */

import {
	bushBatchStats,
	createBushBatchDefinitions
} from './VillageBushBatchGeometry.js';
import { createVillageGardenBedDefinitions } from './VillageGardenBedGeometry.js';
import { createVillageShoreStoneDefinitions } from './VillageShoreStoneGeometry.js';

/**
 * Creates the collision-faithful essential landscape without procedural botany.
 *
 * @param {object} groundSampler Canonical terrain sampling contract.
 * @param {string} quality Active world quality label.
 * @returns {{definitions: object[], stats: object}} Essential definitions and evidence.
 */
export function createVillageEssentialLandscapeDefinitions(
	groundSampler,
	quality = 'high'
) {
	const bushBatches = createBushBatchDefinitions(groundSampler);
	const gardenBeds = createVillageGardenBedDefinitions(groundSampler);
	const shoreStones = createVillageShoreStoneDefinitions(groundSampler);
	const bushStats = bushBatchStats(bushBatches);

	return {
		definitions: [
			...bushBatches,
			...gardenBeds,
			...shoreStones
		],
		stats: {
			botanicalDeferred: true,
			bushes: bushStats.instances,
			bushBatches: bushStats.batches,
			bushTriangles: bushStats.triangles,
			flowerBatches: 0,
			flowerInstances: 0,
			flowerSpecies: 0,
			flowerTriangles: 0,
			flowerVertices: 0,
			gardenBeds: gardenBeds.length,
			quality,
			shoreStones: shoreStones.length
		}
	};
}

export default createVillageEssentialLandscapeDefinitions;
