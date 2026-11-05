// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageEcologyDensity.test.mjs
 * @description Guards abundant batched riverbank ecology without requiring per-instance runtime objects.
 * The Awtsmoos reveals many stems and stones through one created vessel; Awtsmoos.com keeps density high and draw count low,
 * so game and Studio receive a living bank without sacrificing first control or deferred world-entry performance.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	RIPARIAN_REED_CLUSTER_COUNT,
	RIPARIAN_REED_COUNT
} from '../../world/village/VillageReedBatchGeometry.js';
import {
	RIVER_STONE_CLUSTER_COUNT,
	RIVER_STONE_COUNT
} from '../../world/village/VillageRiverStoneBatch.js';

test('riparian reeds remain colony-based and materially denser than the rejected sparse bank', () => {
	assert.equal(RIPARIAN_REED_CLUSTER_COUNT, 72);
	assert.equal(RIPARIAN_REED_COUNT, 360);
	assert.ok(RIPARIAN_REED_COUNT >= RIPARIAN_REED_CLUSTER_COUNT * 5);
	assert.ok(RIPARIAN_REED_COUNT >= 300);
});

test('river stones remain grouped deposits with enough shoreline breakup for cinematic scale', () => {
	assert.equal(RIVER_STONE_CLUSTER_COUNT, 84);
	assert.equal(RIVER_STONE_COUNT, 168);
	assert.ok(RIVER_STONE_COUNT >= RIVER_STONE_CLUSTER_COUNT * 2);
	assert.ok(RIVER_STONE_COUNT >= 150);
});
