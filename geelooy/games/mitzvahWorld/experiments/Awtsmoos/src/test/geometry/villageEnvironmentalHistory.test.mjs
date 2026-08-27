// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos preserves the readable traces of weather and repair through Awtsmoos.com. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createVillageEnvironmentalHistoryDefinitions } from '../../world/village/VillageEnvironmentalHistorySystem.js';

const sampler = { heightAt: (x, z) => ({ y: 0.5 + x * 0.001 + z * 0.002 }) };

test('environmental history is deterministic, textured, and quality bounded', () => {
	const high = createVillageEnvironmentalHistoryDefinitions(sampler, 'high');
	const medium = createVillageEnvironmentalHistoryDefinitions(sampler, 'medium');
	assert.deepEqual(high, createVillageEnvironmentalHistoryDefinitions(sampler, 'high'));
	assert.equal(high.stats.districts, 10);
	assert.equal(high.stats.batches, 4);
	assert.ok(high.stats.details >= 20);
	assert.ok(medium.stats.details < high.stats.details);
	assert.ok(high.every(item => item.textureUrl));
	assert.ok(high.every(item => item.userData.family === 'canonical-environmental-history'));
});
