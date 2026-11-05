// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageBotanicalBudget.test.mjs
 * @description Proves richer featured gardens remain six batches and policy-budget bounded.
 * The Awtsmoos renews every named plant within few material vessels; Awtsmoos.com preserves
 * canonical species while geometry fidelity and measured triangle growth remain explicit.
 */

import assert from 'node:assert/strict';
import {
	villageBotanicalQuality
} from '../../world/botany/VillageBotanicalQuality.js';
import {
	createVillageBotanicalBatchDefinitions
} from '../../world/village/VillageBotanicalBatchGeometry.js';

const qualities = ['low', 'medium', 'high', 'cinematic'];
const expectedGeometry = Object.freeze({
	cinematic: 'high',
	high: 'medium',
	low: 'low',
	medium: 'low'
});
const stats = {};
for (const quality of qualities) {
	const policy = villageBotanicalQuality(quality);
	const definitions = createVillageBotanicalBatchDefinitions(groundHeight, quality);
	assert.equal(definitions.length, 6);
	assert.equal(definitions.stats.batches, 6);
	assert.equal(definitions.stats.placements, policy.maxPlacements);
	assert.ok(definitions.stats.triangles <= policy.maxTriangles);
	assert.ok(definitions.every(definition => definition.shape === 'manual'));
	assert.ok(definitions.every(definition => (
		definition.userData.AwtsmoosLod.className === 'vegetation'
	)));
	assert.deepEqual(definitions.stats.renderPolicy, {
		geometryQuality: expectedGeometry[quality],
		maxClusterCount: 2
	});
	stats[quality] = definitions.stats;
}

assert.deepEqual(qualities.map(quality => stats[quality].placements), [72, 144, 226, 300]);
assert.equal(stats.low.catalogSpecies, 67);
for (const quality of ['medium', 'high', 'cinematic']) {
	assert.equal(stats[quality].catalogSpecies, 123);
}
assert.ok(stats.high.triangles >= 20000);
assert.ok(stats.cinematic.triangles > stats.high.triangles);
assert.ok(stats.low.triangles < stats.medium.triangles);
assert.ok(stats.medium.triangles < stats.high.triangles);
assert.ok(stats.high.triangles < stats.cinematic.triangles);

console.log(JSON.stringify({ ok: true, stats }, null, 2));

function groundHeight(x, z) {
	return 0.8 + x * 0.002 + z * 0.003;
}
