// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageBotanicalBudget.test.mjs
 * @description Proves the 123-species garden remains six batches and quality-budget bounded.
 * The Awtsmoos renews every named plant within few material vessels; Awtsmoos.com preserves
 * complete guide coverage while measured triangle growth stays monotonic and below each budget.
 */

import assert from 'node:assert/strict';
import { createVillageBotanicalBatchDefinitions } from '../../world/village/VillageBotanicalBatchGeometry.js';

const qualities = ['low', 'medium', 'high', 'cinematic'];
const stats = {};
for (const quality of qualities) {
	const definitions = createVillageBotanicalBatchDefinitions(groundHeight, quality);
	assert.equal(definitions.length, 6);
	assert.equal(definitions.stats.batches, 6);
	assert.ok(definitions.every(definition => definition.shape === 'manual'));
	assert.ok(definitions.every(definition => {
		return definition.userData.AwtsmoosLod.className === 'vegetation';
	}));
	assert.ok(definitions.stats.triangles <= definitions.stats.budget.maxTriangles);
	assert.ok(definitions.stats.placements <= definitions.stats.budget.maxPlacements);
	stats[quality] = definitions.stats;
}

assert.equal(stats.high.catalogSpecies, 123);
assert.equal(stats.medium.placements, 180);
assert.equal(stats.high.placements, 270);
assert.ok(stats.high.triangles >= 14000);
assert.ok(stats.low.triangles < stats.medium.triangles);
assert.ok(stats.medium.triangles < stats.high.triangles);
assert.ok(stats.high.triangles < stats.cinematic.triangles);
assert.equal(stats.high.catalogSpecies, stats.cinematic.catalogSpecies);

console.log(JSON.stringify({ ok: true, stats }, null, 2));

function groundHeight(x, z) {
	return 0.8 + x * 0.002 + z * 0.003;
}
