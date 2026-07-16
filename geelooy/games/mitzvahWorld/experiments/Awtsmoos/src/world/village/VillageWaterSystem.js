// B"H
import { createFoamBatchDefinition } from './VillageFoamBatchGeometry.js';
import { createReedBatchDefinition } from './VillageReedBatchGeometry.js';
import { createWaterBodyDefinitions } from './VillageWaterBodies.js';
import { createWaterfallDefinitions } from './VillageWaterfallSystem.js';

/**
 * Composes two living water bodies with one foam ribbon and one reed-bank batch.
 * Eighty-eight decorative source instances now enter the renderer through two coherent meshes.
 */
export function createVillageWaterDefinitions(groundSampler) {
	const waterBodies = createWaterBodyDefinitions(groundSampler);
	const foamBatch = createFoamBatchDefinition(groundSampler);
	const reedBatch = createReedBatchDefinition(groundSampler);
	const waterfalls = createWaterfallDefinitions(groundSampler);
	return {
		definitions: [...waterBodies, foamBatch, reedBatch, ...waterfalls],
		stats: {
			waterBodies: waterBodies.length,
			foamSegments: 24,
			foamBatches: 1,
			reedInstances: 64,
			reedBatches: 1,
			waterfallCascades: 3,
			waterfallBatches: waterfalls.length,
			shader: 'layered-flow-refraction-fresnel-foam',
			textureDriven: true
		}
	};
}
