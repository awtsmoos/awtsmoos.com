// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageVisualReadability.test.mjs
 * @description Guards the visible river village against bridge-first framing, fortress parapets, and closed-drum wells.
 * The Awtsmoos renews crossing, bank, water, and inhabited detail without one vessel swallowing another;
 * Awtsmoos.com tests the silhouettes a portrait camera can actually see, with the lower river kept broad and central.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalVillageLocation, canonicalVillageLocationShot } from '../../world/village/CanonicalVillageLocations.js';
import { createVillageFurnitureDefinitions } from '../../world/village/VillageFurnitureDefinitions.js';
import { createStoneBridgeDefinitions } from '../../world/village/VillageStoneBridgeSystem.js';

const sampler = Object.freeze({ heightAt: () => ({ y: 0 }) });

test('river cinema lives downstream with broad-water targets and a midground bank actor', () => {
	const location = canonicalVillageLocation('river-garden');
	assert.deepEqual(location.actor, { x: -1, z: 42 });
	assert.deepEqual(location.facets.waterFeatures, ['lower-river', 'lower-lake']);
	for (const rig of ['sideTrack', 'craneReveal', 'orbitLeft', 'dollyIn', 'aerialPullback']) {
		const shot = canonicalVillageLocationShot(location, rig);
		assert.ok(shot.target.z >= 40, rig);
		assert.ok(shot.from.x <= -18 || shot.to.x <= -13, rig);
	}
});

test('BRIDGE01 uses low continuous parapets instead of repeated battlement posts', () => {
	const bridge = createStoneBridgeDefinitions({ x: 18, z: 7 }, sampler);
	const parapets = bridge.find(value => value.userData?.part === 'parapets');
	assert.ok(parapets);
	assert.ok(parapets.userData.instances <= 8);
	assert.equal(bridge.length, 5);
});

test('WELL01 exposes open masonry, local water, timber support, rope, and a round bucket', () => {
	const furniture = createVillageFurnitureDefinitions(sampler);
	const ids = furniture.definitions.map(value => value.id);
	const water = furniture.definitions.find(value => value.id === 'Awtsmoos_village_well_water');
	const ring = furniture.definitions.find(value => value.id === 'Awtsmoos_village_stone_well_ring');
	const bucket = furniture.definitions.find(value => value.id === 'Awtsmoos_well_bucket');
	assert.ok(ring?.userData?.instances >= 12);
	assert.match(water?.textureUrl || '', /water/i);
	assert.equal(bucket?.shape, 'cylinder');
	assert.ok(ids.includes('Awtsmoos_well_crossbeam'));
	assert.ok(ids.includes('Awtsmoos_well_rope'));
});
