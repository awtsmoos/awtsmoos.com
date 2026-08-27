// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverHydrology.test.mjs
 * @description Proves one descending alpine water story with bounded realistic draw vessels.
 * The Awtsmoos joins source, cascades, current, bed, reeds, wet stones, lake, and outlet;
 * Awtsmoos.com guards richer banks through trusted assets without multiplying transparent water.
 */

import assert from 'node:assert/strict';
import { createRiverHydrology } from '../../world/village/VillageRiverHydrology.js';
import { RIVER_SURFACE_LANE_COUNT } from '../../world/village/VillageRiverSurfaceSection.js';
import { createWaterBodyDefinitions } from '../../world/village/VillageWaterBodies.js';
import { createWaterfallDefinitions } from '../../world/village/VillageWaterfallSystem.js';
import { createVillageWaterDefinitions } from '../../world/village/VillageWaterSystem.js';
import { assertLocalMaterialUrl } from '../assets/LocalMaterialTestSupport.mjs';

const EXPECTED_FLOW_REGIMES = [
	'mountain-source', 'plunge-pool', 'fast-narrows',
	'village-current', 'calm-lower-pool', 'outlet-run'
];
const sampler = createSampler();
const hydrology = createRiverHydrology(sampler);
const bodies = createWaterBodyDefinitions(sampler, hydrology);
const waterfalls = createWaterfallDefinitions(sampler, hydrology);
const system = createVillageWaterDefinitions(sampler);
const animatedSurfaces = bodies.filter(isAnimatedSurface);
const riverBed = bodies.find(isRiverBed);
const riverSurface = animatedSurfaces.find(hasWaterVariant('river'));
const riverStones = system.definitions.find(hasFamily('river-bank-stones'));

assert.equal(hydrology.points.length, 65);
assert.equal(hydrology.stats.cascades, 3);
assert.deepEqual(hydrology.stats.flowRegimes, EXPECTED_FLOW_REGIMES);
assert.ok(hydrology.stats.sourceY > hydrology.lakeLevel);
assert.ok(hydrology.lakeLevel > hydrology.stats.outletY);
assert.ok(hydrology.stats.totalDrop > 4);
assertDescending(hydrology.points);
assert.ok(substantialDrops(hydrology.points) >= 3);
assert.equal(bodies.length, 3);
assert.ok(bodies.every(definition => definition.shape === 'manual'));
assert.equal(animatedSurfaces.length, 2);
assert.deepEqual(
	animatedSurfaces.map(surface => surface.userData.waterVariant),
	['lake', 'river']
);
assert.ok(animatedSurfaces.every(surface => Boolean(surface.mixTextureUrl)));
assert.ok(riverBed);
assert.equal(riverBed.transparent, false);
assert.equal(riverBed.userData.staticGeometry, true);
assert.equal(riverBed.texturePolicy.role, 'wet-river-stone');
assertLocalMaterialUrl(assert, riverBed.textureUrl);
assert.equal(riverSurface.vertices.length, hydrology.points.length * RIVER_SURFACE_LANE_COUNT);
assert.equal(
	riverSurface.faces.length,
	(hydrology.points.length - 1) * (RIVER_SURFACE_LANE_COUNT - 1)
);
assert.equal(riverSurface.uvs.length, riverSurface.vertices.length * 2);
assert.ok(riverSurface.vertices.flat().every(Number.isFinite));
assert.ok(riverSurface.uvs.every(Number.isFinite));
assert.equal(waterfalls.length, 4);
assert.deepEqual(
	waterfalls.slice(0, 3).map(definition => definition.texturePolicy.waterVariant),
	['waterfall', 'foam', 'mist']
);
assert.ok(riverStones);
assert.equal(riverStones.userData.instances, 36);
assert.equal(riverStones.userData.staticBatch, true);
assert.equal(riverStones.vertices.length, 540);
assert.equal(riverStones.faces.length, 540);
assert.equal(riverStones.solid, false);
assertLocalMaterialUrl(assert, riverStones.textureUrl);
assert.equal(system.definitions.length, 10);
assert.equal(system.stats.connectedSourceToOutlet, true);
assert.equal(system.stats.surfaceWaterBodies, 2);
assert.equal(system.stats.riverBedDraws, 1);
assert.equal(system.stats.riverStoneBatches, 1);
assert.equal(system.stats.riverStoneDraws, 1);
assert.equal(system.stats.riverStoneInstances, 36);
assert.equal(system.stats.transparentWaterDraws, 6);
assert.equal(system.stats.waterDraws, 6);
assert.equal(system.stats.waterfallCascades, 3);

function createSampler() {
	return {
		heightAt: (x, z) => ({ y: 0.4 + x * 0.004 + z * 0.003 }),
		sample: (x, z) => ({ height: 0.4 + x * 0.004 + z * 0.003, x, z })
	};
}

function assertDescending(points) {
	for (let index = 1; index < points.length; index += 1) {
		assert.ok(points[index].y < points[index - 1].y);
	}
}

function substantialDrops(points) {
	return points.slice(1).filter((point, index) => points[index].y - point.y > 0.8).length;
}

function isAnimatedSurface(definition) {
	return definition.texturePolicy?.animated === true && Boolean(definition.userData?.waterVariant);
}

function isRiverBed(definition) {
	return definition.userData?.part === 'river-bed-channel';
}

function hasWaterVariant(variant) {
	return definition => definition.userData?.waterVariant === variant;
}

function hasFamily(family) {
	return definition => definition.userData?.family === family;
}
