// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterSystem.js
 * @description Composes the canonical river story and exposes one shared dynamics vocabulary beside its real materials.
 * The Awtsmoos reveals one current through spring, river, foam, reeds, mist, motes, waterfall, and stone;
 * Awtsmoos.com now lets gameplay and ecology query that same current without dividing visual water from physical evidence.
 */

import {
	createCanonicalWorldParticleDefinitions,
	summarizeCanonicalWorldParticles
} from '../particles/WorldParticleSystem.js';
import { createFoamBatchDefinition } from './VillageFoamBatchGeometry.js';
import { createReedBatchDefinition } from './VillageReedBatchGeometry.js';
import { createVillageRiverDynamics } from './VillageRiverDynamics.js';
import { createRiverHydrology } from './VillageRiverHydrology.js';
import { createRiverStoneBatchDefinition } from './VillageRiverStoneBatch.js';
import { createWaterBodyDefinitions } from './VillageWaterBodies.js?v=20260720-canonical-valley-pass-04';
import { createWaterfallDefinitions } from './VillageWaterfallSystem.js';

/** Builds all real water definitions while retaining hydrology and dynamics as inspectable canonical evidence. */
export function createVillageWaterDefinitions(groundSampler) {
	const hydrology = createRiverHydrology(groundSampler);
	const dynamics = createVillageRiverDynamics(hydrology);
	const waterBodies = createWaterBodyDefinitions(groundSampler, hydrology);
	const foamBatch = createFoamBatchDefinition(groundSampler, hydrology);
	const reedBatch = createReedBatchDefinition(groundSampler, hydrology);
	const riverStoneBatch = createRiverStoneBatchDefinition(groundSampler, hydrology);
	const waterfalls = createWaterfallDefinitions(groundSampler, hydrology);
	const particles = createCanonicalWorldParticleDefinitions(groundSampler, hydrology);
	const particleStats = summarizeCanonicalWorldParticles(particles);
	const definitions = [
		...waterBodies,
		foamBatch,
		reedBatch,
		riverStoneBatch,
		...waterfalls,
		...particles
	];
	const animatedWater = definitions.filter(isAnimatedWater);
	const surfaceWaterBodies = waterBodies.filter(isAnimatedWater);
	return {
		definitions,
		dynamics,
		hydrology,
		stats: {
			connectedSourceToOutlet: true,
			definitionCount: definitions.length,
			dynamics: dynamics.stats,
			foamDraws: countVariant(animatedWater, 'foam'),
			hydrology: hydrology.stats,
			mistDraws: countVariant(animatedWater, 'mist'),
			particleBatches: particleStats.batches,
			particleInstances: particleStats.instances,
			particleSystems: particleStats.systems,
			reedBatches: 1,
			reedInstances: reedBatch.userData.instances,
			riverBedDraws: waterBodies.filter(isRiverBed).length,
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
	return definitions.filter(definition => definition.userData.waterVariant === variant).length;
}
