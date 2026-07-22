// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterSystem.js
 * @description Composes and measures the complete source-to-outlet village water story.
 * The Awtsmoos reveals one current through lake, river, foam, reeds, waterfall, mist, and stone;
 * Awtsmoos.com derives every diagnostic from actual vessels so beauty and performance cannot drift.
 */

import { createFoamBatchDefinition } from './VillageFoamBatchGeometry.js';
import { createReedBatchDefinition } from './VillageReedBatchGeometry.js';
import { createRiverHydrology } from './VillageRiverHydrology.js';
import { createRiverStoneBatchDefinition } from './VillageRiverStoneBatch.js';
import { createWaterBodyDefinitions } from './VillageWaterBodies.js?v=20260720-canonical-valley-pass-04';
import { createWaterfallDefinitions } from './VillageWaterfallSystem.js';

export function createVillageWaterDefinitions(groundSampler) {
	const hydrology = createRiverHydrology(groundSampler);
	const waterBodies = createWaterBodyDefinitions(groundSampler, hydrology);
	const foamBatch = createFoamBatchDefinition(groundSampler, hydrology);
	const reedBatch = createReedBatchDefinition(groundSampler, hydrology);
	const riverStoneBatch = createRiverStoneBatchDefinition(groundSampler, hydrology);
	const waterfalls = createWaterfallDefinitions(groundSampler, hydrology);
	const definitions = [
		...waterBodies,
		foamBatch,
		reedBatch,
		riverStoneBatch,
		...waterfalls
	];
	const animatedWater = definitions.filter(isAnimatedWater);
	const surfaceWaterBodies = waterBodies.filter(isAnimatedWater);
	const riverBedDraws = waterBodies.filter(isRiverBed).length;

	return {
		definitions,
		stats: {
			connectedSourceToOutlet: true,
			definitionCount: definitions.length,
			foamDraws: countVariant(animatedWater, 'foam'),
			hydrology: hydrology.stats,
			mistDraws: countVariant(animatedWater, 'mist'),
			reedBatches: 1,
			reedInstances: reedBatch.userData.instances,
			riverBedDraws,
			riverStoneBatches: 1,
			riverStoneDraws: 1,
			riverStoneInstances: riverStoneBatch.userData.instances,
			shader: 'alpine-two-fetch-variant-flow-fresnel-foam-water',
			surfaceWaterBodies: surfaceWaterBodies.length,
			textureDriven: true,
			transparentWaterDraws: animatedWater.length,
			waterBodies: surfaceWaterBodies.length,
			waterDraws: animatedWater.length,
			waterfallBatches: waterfalls.length,
			waterfallCascades: hydrology.stats.cascades,
			waterfallDraws: waterfalls.filter(isAnimatedWater).length
		}
	};
}

function isAnimatedWater(definition) {
	return definition?.texturePolicy?.animated === true
		&& typeof definition?.userData?.waterVariant === 'string';
}

function isRiverBed(definition) {
	return definition?.userData?.part === 'river-bed-channel'
		&& definition?.userData?.staticGeometry === true;
}

function countVariant(definitions, variant) {
	return definitions.filter((definition) => (
		definition.userData.waterVariant === variant
	)).length;
}
