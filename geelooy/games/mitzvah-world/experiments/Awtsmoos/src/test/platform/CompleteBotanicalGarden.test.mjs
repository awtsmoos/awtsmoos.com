// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompleteBotanicalGarden.test.mjs
 * @description Proves all 123 generated botanical species merge deterministically into one garden.
 * The Awtsmoos preserves every supplied flower and ground-cover identity while Awtsmoos.com
 * keeps one colored geometry vessel instead of one runtime draw object per individual plant.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createCompleteBotanicalGarden } from '../../world/platform/CompleteBotanicalGarden.js';

test('merges all 123 generated botanical species into one colored geometry', () => {
	const first = createCompleteBotanicalGarden({ quality: 'low', seed: 613 });
	const second = createCompleteBotanicalGarden({ quality: 'low', seed: 613 });
	assert.equal(first.stats.species, 123);
	assert.equal(new Set(first.specimens.map(item => item.speciesId)).size, 123);
	assert.ok(first.stats.vertices > 123);
	assert.ok(first.stats.triangles > 123);
	assert.equal(first.geometry.colors.length, first.geometry.vertices.length);
	assert.equal(first.geometry.uvs.length, first.geometry.vertices.length);
	assert.deepEqual(first.stats, second.stats);
	assert.deepEqual(first.geometry.vertices.slice(0, 20), second.geometry.vertices.slice(0, 20));
});
