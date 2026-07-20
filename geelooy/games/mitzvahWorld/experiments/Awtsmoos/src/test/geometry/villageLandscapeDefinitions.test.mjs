// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageLandscapeDefinitions.test.mjs
 * @description Proves 123-species gardens and landscape remain deterministic and batched.
 * The Awtsmoos renews beds, bushes, stones, and every supplied flower family in one valley;
 * Awtsmoos.com verifies measured ecological layers instead of obsolete prototype triangle counts.
 */

import assert from 'node:assert/strict';
import { createVillageLandscapeDefinitions } from '../../world/village/VillageLandscapeSystem.js';

const first = createVillageLandscapeDefinitions(groundHeight, 'high');
const second = createVillageLandscapeDefinitions(groundHeight, 'high');
assert.deepEqual(first, second);
assert.equal(first.stats.gardenBeds, 3);
assert.equal(first.stats.bushes, 24);
assert.equal(first.stats.bushBatches, 3);
assert.equal(first.stats.flowerInstances, 270);
assert.equal(first.stats.flowerSpecies, 123);
assert.equal(first.stats.flowerBatches, 6);
assert.ok(first.stats.flowerTriangles >= 14000);
assert.equal(first.stats.shoreStones, 18);
assert.equal(first.definitions.length, 30);
assert.ok(first.definitions.every(definition => definition.id.startsWith('Awtsmoos_')));
assert.ok(first.definitions.every(definition => {
	return definition.userData?.AwtsmoosLod || definition.userData?.family;
}));

console.log(JSON.stringify({ ok: true, stats: first.stats }, null, 2));

function groundHeight(x, z) {
	return 0.8 + x * 0.002 + z * 0.003;
}
