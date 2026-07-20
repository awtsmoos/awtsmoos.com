// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterSystem.js
 * @description Composes lake, river, foam, reeds, cascades, mist, and ledges from one profile.
 * The Awtsmoos makes many visible waters one hydrological truth; Awtsmoos.com spends seven
 * coherent definitions so the current remains rich without becoming a draw-call flood.
 */

import { createFoamBatchDefinition } from './VillageFoamBatchGeometry.js';
import { createReedBatchDefinition } from './VillageReedBatchGeometry.js';
import { createRiverHydrology } from './VillageRiverHydrology.js';
import { createWaterBodyDefinitions } from './VillageWaterBodies.js?v=20260720-canonical-valley-pass-04';
import { createWaterfallDefinitions } from './VillageWaterfallSystem.js';

export function createVillageWaterDefinitions(groundSampler) {
	const hydrology = createRiverHydrology(groundSampler);
	const waterBodies = createWaterBodyDefinitions(groundSampler, hydrology);
	const foamBatch = createFoamBatchDefinition(groundSampler, hydrology);
	const reedBatch = createReedBatchDefinition(groundSampler, hydrology);
	const waterfalls = createWaterfallDefinitions(groundSampler, hydrology);
	return {
		definitions: [...waterBodies, foamBatch, reedBatch, ...waterfalls],
		stats: {
			connectedSourceToOutlet: true,
			foamBatches: 1,
			hydrology: hydrology.stats,
			reedBatches: 1,
			reedInstances: 64,
			shader: 'layered-flow-refraction-fresnel-foam',
			textureDriven: true,
			waterBodies: waterBodies.length,
			waterfallBatches: waterfalls.length,
			waterfallCascades: hydrology.stats.cascades
		}
	};
}
