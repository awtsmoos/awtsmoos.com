// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverHydrology.test.mjs
 * @description Proves descending hydrology, densified water, explicit source and bed, cascades, stones, and bounded particle fields.
 * The Awtsmoos joins concealed spring, smooth current, lake, bed, wet stones, mist, and outlet while each keeps its measured role;
 * Awtsmoos.com consumes exported density and system diagnostics so the test follows reality rather than an ancient frozen whole.
 */

import assert from 'node:assert/strict';
import { createRiverHydrology } from '../../world/village/VillageRiverHydrology.js';
import { RIVER_SURFACE_LANE_COUNT } from '../../world/village/VillageRiverSurfaceSection.js';
import { RIVER_STONE_COUNT } from '../../world/village/VillageRiverStonePlacement.js';
import { createWaterBodyDefinitions } from '../../world/village/VillageWaterBodies.js';
import { createWaterfallDefinitions } from '../../world/village/VillageWaterfallSystem.js';
import { createVillageWaterDefinitions } from '../../world/village/VillageWaterSystem.js';
import { assertLocalMaterialUrl } from '../assets/LocalMaterialTestSupport.mjs';
import {
	assertVillageRiverDescending,
	createVillageRiverTestSampler,
	hasVillageWaterFamily,
	hasVillageWaterVariant,
	isPrimaryAnimatedVillageWater,
	isVillageRiverBed,
	isVillageWellspring,
	substantialVillageRiverDrops
} from './VillageRiverHydrologyTestSupport.mjs';

const EXPECTED_FLOW_REGIMES = [
	'mountain-source', 'plunge-pool', 'fast-narrows',
	'village-current', 'calm-lower-pool', 'outlet-run'
];
const STONE_VERTICES_PER_INSTANCE = 15;
const sampler = createVillageRiverTestSampler();
const hydrology = createRiverHydrology(sampler);
const bodies = createWaterBodyDefinitions(sampler, hydrology);
const waterfalls = createWaterfallDefinitions(sampler, hydrology);
const system = createVillageWaterDefinitions(sampler);
const primarySurfaces = bodies.filter(isPrimaryAnimatedVillageWater);
const wellspring = bodies.find(isVillageWellspring);
const riverBed = bodies.find(isVillageRiverBed);
const riverSurface = primarySurfaces.find(hasVillageWaterVariant('river'));
const riverStones = system.definitions.find(hasVillageWaterFamily('river-bank-stones'));

assert.equal(hydrology.points.length, 65);
assert.equal(hydrology.stats.cascades, 3);
assert.deepEqual(hydrology.stats.flowRegimes, EXPECTED_FLOW_REGIMES);
assert.ok(hydrology.stats.sourceY > hydrology.lakeLevel);
assert.ok(hydrology.lakeLevel > hydrology.stats.outletY);
assert.ok(hydrology.stats.totalDrop > 4);
assertVillageRiverDescending(assert, hydrology.points);
assert.ok(substantialVillageRiverDrops(hydrology.points) >= 3);
assert.equal(bodies.length, 4);
assert.ok(bodies.every(definition => definition.shape === 'manual'));
assert.ok(wellspring);
assert.equal(wellspring.texturePolicy.animated, true);
assert.match(wellspring.textureUrl, /shallow%20river%20water\.png$/);
assert.match(wellspring.mixTextureUrl, /seamless%20water\.png$/);
assert.equal(primarySurfaces.length, 2);
assert.deepEqual(primarySurfaces.map(surface => surface.userData.waterVariant), ['lake', 'river']);
assert.ok(primarySurfaces.every(surface => Boolean(surface.mixTextureUrl)));
assert.ok(riverBed);
assert.equal(riverBed.transparent, false);
assert.equal(riverBed.userData.staticGeometry, true);
assert.equal(riverBed.texturePolicy.role, 'submerged-wet-river-stone');
assertLocalMaterialUrl(assert, riverBed.textureUrl);
assert.ok(riverSurface.surfacePoints.length > hydrology.points.length);
assert.ok(riverSurface.surfacePoints.length <= 256);
assert.equal(riverSurface.vertices.length, riverSurface.surfacePoints.length * RIVER_SURFACE_LANE_COUNT);
assert.equal(riverSurface.faces.length, (riverSurface.surfacePoints.length - 1) * (RIVER_SURFACE_LANE_COUNT - 1));
assert.equal(riverSurface.uvs.length, riverSurface.vertices.length * 2);
assert.ok(riverSurface.vertices.flat().every(Number.isFinite));
assert.ok(riverSurface.uvs.every(Number.isFinite));
assert.equal(waterfalls.length, 4);
assert.deepEqual(waterfalls.slice(0, 3).map(definition => definition.texturePolicy.waterVariant), ['waterfall', 'foam', 'mist']);
assert.ok(riverStones);
assert.equal(riverStones.userData.instances, RIVER_STONE_COUNT);
assert.equal(riverStones.userData.staticBatch, true);
assert.equal(riverStones.vertices.length, RIVER_STONE_COUNT * STONE_VERTICES_PER_INSTANCE);
assert.equal(riverStones.faces.length, RIVER_STONE_COUNT * STONE_VERTICES_PER_INSTANCE);
assert.equal(riverStones.solid, false);
assertLocalMaterialUrl(assert, riverStones.textureUrl);
assert.equal(system.definitions.length, 14);
assert.equal(system.stats.definitionCount, 14);
assert.equal(system.stats.connectedSourceToOutlet, true);
assert.equal(system.stats.surfaceWaterBodies, 3);
assert.equal(system.stats.riverBedDraws, 1);
assert.equal(system.stats.riverStoneBatches, 1);
assert.equal(system.stats.riverStoneDraws, 1);
assert.equal(system.stats.riverStoneInstances, RIVER_STONE_COUNT);
assert.equal(system.stats.particleBatches, 3);
assert.equal(system.stats.particleInstances, 252);
assert.equal(system.stats.transparentWaterDraws, 7);
assert.equal(system.stats.waterDraws, 7);
assert.equal(system.stats.waterfallCascades, 3);
