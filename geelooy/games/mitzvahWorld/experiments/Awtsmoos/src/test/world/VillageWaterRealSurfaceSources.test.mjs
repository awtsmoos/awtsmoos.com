// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterRealSurfaceSources.test.mjs
 * @description Proves the canonical river uses real shallow-water primary imagery plus independent seamless detail.
 * The Awtsmoos lets current and reflection meet without borrowing the bright lake as a counterfeit river layer;
 * Awtsmoos.com verifies primary, detail, bed, hydrology, and animated policy through one transparent witness.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MOUNTAIN_VILLAGE_SOURCES as S } from '../../world/materials/MountainVillageMaterialSources.js';
import { createRiverHydrology } from '../../world/village/VillageRiverHydrology.js';
import { createWaterBodyDefinitions } from '../../world/village/VillageWaterBodies.js';
import { villageWaterSurfaceSources } from '../../world/village/VillageWaterSurfaceSources.js';

const ground = {
	heightAt: (x, z) => ({ y: 0.2 + x * 0.001 - z * 0.002 }),
	sample: (x, z) => ({ height: 0.2 + x * 0.001 - z * 0.002, x, z })
};

test('river primary and detail are distinct real water photographs', () => {
	const river = villageWaterSurfaceSources('river');
	assert.equal(river.primary, S.waterStream);
	assert.equal(river.detail, S.waterStill);
	assert.notEqual(river.primary, river.detail);
	assert.match(river.primary, /shallow%20river%20water\.png$/);
	assert.match(river.detail, /seamless%20water\.png$/);
	assert.doesNotMatch(river.detail, /brighter/);
});

test('lake keeps bright primary while sharing the seamless detail family', () => {
	const lake = villageWaterSurfaceSources('lake');
	assert.equal(lake.primary, S.waterLake);
	assert.equal(lake.detail, S.waterStill);
	assert.match(lake.primary, /seamless%20water%20brighter\.png$/);
});

test('canonical river definition carries real source pair and physical animation', () => {
	const hydrology = createRiverHydrology(ground);
	const definitions = createWaterBodyDefinitions(ground, hydrology);
	const river = definitions.find(definition => definition.userData?.waterVariant === 'river'
		&& definition.id === 'Awtsmoos_flowing_stream_alpine_current_water');
	const bed = definitions.find(definition => definition.userData?.part === 'river-bed-channel');
	assert.equal(definitions.length, 4);
	assert.ok(river);
	assert.equal(river.textureUrl, S.waterStream);
	assert.equal(river.mixTextureUrl, S.waterStill);
	assert.equal(river.mixStrength, 0.42);
	assert.equal(river.texturePolicy.animated, true);
	assert.equal(river.shape, 'manual');
	assert.ok(river.vertices.length > 100);
	assert.ok(bed);
	assert.equal(bed.texturePolicy.role, 'submerged-wet-river-stone');
	assert.equal(bed.transparent, false);
});
