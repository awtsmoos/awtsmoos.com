// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageLandscapeDefinitions.test.mjs
 * @description Proves canonical gardens and landscape remain deterministic and batched.
 * The Awtsmoos renews beds, bushes, stones, and supplied flower families in one valley;
 * Awtsmoos.com verifies measured ecology rather than obsolete prototype instance counts.
 */

import assert from 'node:assert/strict';
import { villageBotanicalQuality } from '../../world/botany/VillageBotanicalQuality.js';
import { createVillageLandscapeDefinitions } from '../../world/village/VillageLandscapeSystem.js';

const first = createVillageLandscapeDefinitions(groundHeight, 'high');
const second = createVillageLandscapeDefinitions(groundHeight, 'high');
const policy = villageBotanicalQuality('high');

assert.deepEqual(first, second);
assert.equal(first.stats.gardenBeds, 3);
assert.equal(first.stats.bushes, 24);
assert.equal(first.stats.bushBatches, 3);
assert.equal(first.stats.flowerInstances, policy.maxPlacements);
assert.equal(first.stats.flowerSpecies, 123);
assert.equal(first.stats.flowerBatches, 6);
assert.ok(first.stats.flowerTriangles >= 16000);
assert.ok(first.stats.flowerTriangles <= policy.maxTriangles);
assert.equal(first.stats.shoreStones, 18);
assert.equal(first.definitions.length, 30);
assert.ok(first.definitions.every(definition => definition.id.startsWith('Awtsmoos_')));
assert.ok(first.definitions.every(definition => (
	definition.userData?.AwtsmoosLod || definition.userData?.family
)));

console.log(JSON.stringify({ ok: true, stats: first.stats }, null, 2));

function groundHeight(x, z) {
	return 0.8 + x * 0.002 + z * 0.003;
}
