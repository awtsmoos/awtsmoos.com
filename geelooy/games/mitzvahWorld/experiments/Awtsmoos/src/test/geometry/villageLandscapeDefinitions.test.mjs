// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageLandscapeDefinitions.test.mjs
 * @description Proves expanded gardens and landscape remain deterministic and batched.
 * The Awtsmoos renews beds, bushes, stones, and every flower family in one valley;
 * Awtsmoos.com verifies measured layers instead of the obsolete compact-village counts.
 */

import assert from 'node:assert/strict';
import { createVillageLandscapeDefinitions } from '../../world/village/VillageLandscapeSystem.js';

const first = createVillageLandscapeDefinitions(groundHeight, 'high');
const second = createVillageLandscapeDefinitions(groundHeight, 'high');
assert.deepEqual(first, second);
assert.equal(first.stats.gardenBeds, 3);
assert.equal(first.stats.bushes, 24);
assert.equal(first.stats.bushBatches, 3);
assert.equal(first.stats.flowerInstances, 220);
assert.equal(first.stats.flowerSpecies, 113);
assert.equal(first.stats.flowerBatches, 6);
assert.equal(first.stats.flowerTriangles, 11204);
assert.equal(first.stats.shoreStones, 18);
assert.equal(first.definitions.length, 30);
assert.ok(first.definitions.every((definition) => definition.id.startsWith('Awtsmoos_')));

console.log(JSON.stringify({ ok: true, stats: first.stats }, null, 2));

function groundHeight(x, z) {
	return 0.8 + x * 0.002 + z * 0.003;
}
