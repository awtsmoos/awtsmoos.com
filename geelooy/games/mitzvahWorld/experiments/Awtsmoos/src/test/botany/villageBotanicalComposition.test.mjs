// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageBotanicalComposition.test.mjs
 * @description Proves exact botanical budgets occupy deterministic spatially valid sites.
 * The Awtsmoos renews abundance without road, house, river, slope, or neighbor confusion;
 * Awtsmoos.com keeps every quality tier and measured site evidence inspectable.
 */

import assert from 'node:assert/strict';
import { listBotanicalSpecies } from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { createVillageBotanicalComposition } from '../../world/botany/VillageBotanicalComposition.js';
import { villageBotanicalQuality } from '../../world/botany/VillageBotanicalQuality.js';

const qualities = ['low', 'medium', 'high', 'cinematic'];
const gardens = Object.fromEntries(qualities.map(quality => [
	quality,
	createVillageBotanicalComposition(groundHeight, quality)
]));

assert.deepEqual(gardens.high, createVillageBotanicalComposition(groundHeight, 'high'));
assert.equal(gardens.low.stats.primarySpecies, 63);
assert.equal(gardens.low.stats.catalogSpecies, 67);
assert.equal(gardens.low.stats.districts, 9);
for (const quality of ['medium', 'high', 'cinematic']) {
	assert.equal(gardens[quality].stats.catalogSpecies, listBotanicalSpecies().length);
	assert.equal(gardens[quality].stats.primarySpecies, 123);
	assert.equal(gardens[quality].stats.districts, 10);
}

for (const quality of qualities) {
	const garden = gardens[quality];
	const policy = villageBotanicalQuality(quality);
	assert.equal(garden.length, policy.maxPlacements);
	assert.equal(garden.length, garden.stats.placements);
	assert.equal(garden.stats.repeatedPlacements, policy.featuredBudget + policy.repeatBudget);
	assert.deepEqual(garden.stats.renderPolicy, {
		featuredBudget: policy.featuredBudget,
		geometryQuality: 'low',
		maxClusterCount: 2,
		repeatBudget: policy.repeatBudget
	});
	assert.equal(Object.values(garden.stats.lod).reduce((sum, value) => sum + value, 0), garden.length);
	assert.ok(Object.values(garden.stats.lod).every(value => value > 0));
	for (const placement of garden) assertPlacement(placement);
}

assert.deepEqual(qualities.map(quality => gardens[quality].length), [72, 144, 226, 300]);

console.log(JSON.stringify({
	ok: true,
	placements: Object.fromEntries(qualities.map(quality => [quality, gardens[quality].length])),
	high: gardens.high.stats
}, null, 2));

function assertPlacement(placement) {
	assert.ok(Number.isInteger(placement.seed));
	assert.ok(Number.isFinite(placement.scale));
	assert.ok(Number.isFinite(placement.windPhase));
	assert.ok(['near', 'medium', 'far'].includes(placement.lodClass));
	assert.ok(['low', 'medium', 'high'].includes(placement.geometryQuality));
	assert.ok(['x', 'y', 'z'].every(axis => Number.isFinite(placement.position[axis])));
	assert.equal(placement.siteEvidence.valid, true);
	for (const key of ['clearing', 'district', 'footprint', 'river', 'road', 'slope', 'spacing']) {
		assert.ok(placement.siteEvidence[key] >= 0, `${placement.species} violated ${key}`);
	}
	assert.ok(placement.siteEvidence.biome);
}

function groundHeight(x, z) {
	return 0.8 + x * 0.002 + z * 0.003;
}
