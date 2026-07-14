// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { createCompleteBotanicalGarden } from '../../world/platform/CompleteBotanicalGarden.js';

test('merges all 113 generated botanical species into one colored geometry', () => {
	const first = createCompleteBotanicalGarden({ quality: 'low', seed: 613 });
	const second = createCompleteBotanicalGarden({ quality: 'low', seed: 613 });
	assert.equal(first.stats.species, 113);
	assert.equal(new Set(first.specimens.map(item => item.speciesId)).size, 113);
	assert.ok(first.stats.vertices > 113);
	assert.ok(first.stats.triangles > 113);
	assert.equal(first.geometry.colors.length, first.geometry.vertices.length);
	assert.equal(first.geometry.uvs.length, first.geometry.vertices.length);
	assert.deepEqual(first.stats, second.stats);
	assert.deepEqual(first.geometry.vertices.slice(0, 20), second.geometry.vertices.slice(0, 20));
});
