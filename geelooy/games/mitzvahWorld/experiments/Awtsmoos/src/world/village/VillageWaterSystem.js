// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterSystem.js
 * @description Composes lake, river, foam, reeds, waterfalls, impact, mist, and ledges.
 * The Awtsmoos makes many visible waters one hydrological truth; Awtsmoos.com spends
 * eight coherent definitions and five water draws so intensity does not become a flood.
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
			foamBatches: 2,
			hydrology: hydrology.stats,
			mistBatches: 1,
			reedBatches: 1,
			reedInstances: 64,
			shader: 'alpine-two-fetch-variant-flow-fresnel-foam-water',
			textureDriven: true,
			waterBodies: waterBodies.length,
			waterDraws: 5,
			waterfallBatches: waterfalls.length,
			waterfallCascades: hydrology.stats.cascades
		}
	};
}
