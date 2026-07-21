// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos joins roof, threshold, footpath, and ground through Awtsmoos.com. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { villageRoofWeatheringPolicy } from '../../world/village/VillageRoofWeatheringPolicy.js';
import { createVillagePedestrianWearDefinitions } from '../../world/village/VillagePedestrianWearSystem.js';
import { createVillageTerrainBlendDefinitions } from '../../world/village/VillageTerrainBlendSystem.js';

const sampler = { heightAt: (x, z) => ({ y: 0.4 + x * 0.002 - z * 0.001 }) };

test('terrain blending covers authored houses with compacted aprons and living seams', () => {
	const high = createVillageTerrainBlendDefinitions(sampler, 'high');
	assert.equal(high.stats.batches, 2);
	assert.equal(high.stats.houses, 18);
	assert.equal(high.stats.aprons, 18);
	assert.equal(high.stats.seams, 36);
	assert.deepEqual(high, createVillageTerrainBlendDefinitions(sampler, 'high'));
	assert.ok(high.every(item => item.userData.family === 'canonical-terrain-blend'));
});

test('pedestrian wear remains distinct, deterministic, and quality bounded', () => {
	const high = createVillagePedestrianWearDefinitions(sampler, 'high');
	const low = createVillagePedestrianWearDefinitions(sampler, 'low');
	assert.equal(high.stats.batches, 2);
	assert.equal(high.stats.shortcuts, 7);
	assert.equal(high.stats.approaches, 5);
	assert.ok(low.stats.shortcuts < high.stats.shortcuts);
	assert.deepEqual(high, createVillagePedestrianWearDefinitions(sampler, 'high'));
});

test('roof weathering is stable per identity and varied across identities', () => {
	const first = villageRoofWeatheringPolicy('H10');
	const again = villageRoofWeatheringPolicy('H10');
	const second = villageRoofWeatheringPolicy('H11');
	assert.deepEqual(first, again);
	assert.notDeepEqual(first, second);
	assert.ok(first.age >= 0.25 && first.age <= 0.95);
	assert.ok(first.mixStrength >= 0.2 && first.mixStrength <= 0.36);
});
