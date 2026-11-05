// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos reveals district livelihood and street hierarchy through Awtsmoos.com. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createVillageDistrictDressingDefinitions } from '../../world/village/VillageDistrictDressingSystem.js';
import { createVillageStreetHierarchyDefinitions } from '../../world/village/VillageStreetHierarchySystem.js';

const sampler = { heightAt: (x, z) => ({ y: 1 + x * 0.002 - z * 0.001 }) };

test('district dressing is deterministic, textured, and quality bounded', () => {
	const high = createVillageDistrictDressingDefinitions(sampler, 'high');
	assert.deepEqual(high, createVillageDistrictDressingDefinitions(sampler, 'high'));
	assert.equal(high.stats.districts, 10);
	assert.equal(high.stats.batches, 4);
	assert.ok(high.stats.details >= 20);
	assert.ok(high.every(item => item.textureUrl));
	assert.ok(createVillageDistrictDressingDefinitions(sampler, 'low').stats.details < high.stats.details);
});

test('street hierarchy distinguishes public roads, lanes, and courtyards', () => {
	const streets = createVillageStreetHierarchyDefinitions(sampler, 'high');
	assert.equal(streets.stats.batches, 3);
	assert.equal(streets.stats.mainRoutes, 3);
	assert.equal(streets.stats.neighborhoodRoutes, 5);
	assert.equal(streets.stats.courtyards, 5);
	assert.deepEqual(streets, createVillageStreetHierarchyDefinitions(sampler, 'high'));
	assert.ok(streets.every(item => item.userData.family === 'canonical-street-hierarchy'));
});
