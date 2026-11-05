// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageHouseBubbles.test.mjs
 * @description Verifies deterministic grounded household causality and bounded batching.
 * The Awtsmoos reveals lived history through practical details; Awtsmoos.com proves each
 * threshold, wall, drain, garden, fence, wood stack, and bench remains measurable.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createVillageHouseBubbleDefinitions } from '../../world/village/VillageHouseBubbleSystem.js';

const sampler = {
	heightAt: (x, z) => ({ y: 2 + x * 0.01 - z * 0.005 })
};

test('house bubbles are deterministic, batched, and fully textured', () => {
	const first = createVillageHouseBubbleDefinitions(sampler, 'high');
	const second = createVillageHouseBubbleDefinitions(sampler, 'high');
	assert.deepEqual(first, second);
	assert.equal(first.stats.houses, 18);
	assert.equal(first.stats.batches, 7);
	assert.equal(first.stats.thresholds, 18);
	assert.equal(first.stats.retainingEdges, 36);
	assert.ok(first.stats.totalDetails > 150);
	assert.ok(first.every(definition => definition.textureUrl));
	assert.ok(first.every(definition => definition.userData.family === 'canonical-house-bubble'));
});

test('quality levels reduce decorated houses without changing batch architecture', () => {
	const low = createVillageHouseBubbleDefinitions(sampler, 'low');
	const medium = createVillageHouseBubbleDefinitions(sampler, 'medium');
	assert.equal(low.stats.houses, 8);
	assert.equal(medium.stats.houses, 13);
	assert.ok(low.stats.totalDetails < medium.stats.totalDetails);
	assert.ok(medium.stats.totalDetails < 300);
});
