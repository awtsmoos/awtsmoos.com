// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalEnrichmentSystem.js
 * @description Generates six procedural garden batches plus one reactive post-play grass field.
 * The Awtsmoos reveals petals and rooted blades after movement begins; Awtsmoos.com keeps abundance,
 * GPU wind, player wake, and cleanup inside one optional botanical vessel whose geometry remains visual-only.
 */

import { createFlowerBatchDefinitions } from './VillageFlowerBatchGeometry.js';
import { createVillageReactiveGrassBatchDefinition } from './VillageReactiveGrassBatchGeometry.js';

/** Creates deferred botanical definitions and their bounded diagnostics. */
export function createVillageBotanicalEnrichmentDefinitions(
	groundSampler,
	quality = 'high'
) {
	const flowers = createFlowerBatchDefinitions(groundSampler, quality);
	const flowerStats = flowers.stats || {};
	const grass = createVillageReactiveGrassBatchDefinition(groundSampler, quality);
	const definitions = [...flowers, grass];
	const grassStats = grass.userData?.AwtsmoosYardGrass || {};
	const grassTriangles = triangleCount(grass.faces);
	definitions.stats = {
		...flowerStats,
		batches: definitions.length,
		grass: Object.freeze({
			bladeCount: grassStats.bladeCount || 0,
			reactive: grassStats.reactsToPlayer === true,
			triangles: grassTriangles,
			tuftCount: grassStats.tuftCount || 0,
			windStrength: grassStats.windStrength || 0
		}),
		triangles: Number(flowerStats.triangles || 0) + grassTriangles,
		vertices: Number(flowerStats.vertices || 0) + grass.vertices.length
	};
	return {
		definitions,
		stats: {
			batches: definitions.stats.batches,
			deferred: true,
			grass: definitions.stats.grass,
			placements: flowerStats.placements || 0,
			quality,
			species: flowerStats.catalogSpecies || 0,
			triangles: definitions.stats.triangles,
			vertices: definitions.stats.vertices,
			visualOnly: definitions.every(definition => definition.solid === false)
		}
	};
}

function triangleCount(faces = []) {
	return faces.reduce((total, face) => total + Math.max(0, face.length - 2), 0);
}

export default createVillageBotanicalEnrichmentDefinitions;
