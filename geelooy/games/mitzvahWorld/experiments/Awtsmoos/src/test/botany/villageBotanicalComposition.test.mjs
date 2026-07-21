// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageBotanicalComposition.test.mjs
 * @description Proves all 123 species span ten deterministic LOD-aware districts.
 * The Awtsmoos renews abundance without clutter; Awtsmoos.com keeps paths clear,
 * wind finite, quality ordered, and every high-quality species visibly represented.
 */

import assert from 'node:assert/strict';
import { listBotanicalSpecies } from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { createVillageBotanicalComposition } from '../../world/botany/VillageBotanicalComposition.js';
import { VILLAGE_REFERENCE_CLEARINGS } from '../../world/village/VillageReferenceComposition.js';

const qualities = ['low', 'medium', 'high', 'cinematic'];
const gardens = Object.fromEntries(qualities.map((quality) => [
	quality,
	createVillageBotanicalComposition(groundHeight, quality)
]));

assert.deepEqual(gardens.high, createVillageBotanicalComposition(groundHeight, 'high'));
assert.equal(gardens.high.stats.catalogSpecies, listBotanicalSpecies().length);
assert.equal(gardens.high.stats.primarySpecies, 123);
assert.equal(gardens.high.stats.repeatedPlacements, 147);
assert.equal(gardens.high.stats.districts, 10);
assert.deepEqual(gardens.high.stats.lod, { near: 90, medium: 124, far: 56 });
assert.ok(gardens.high.stats.roles['color-mass'] >= 120);
assert.ok(gardens.high.stats.roles['ground-tapestry'] >= 35);

for (const quality of qualities) {
	const garden = gardens[quality];
	assert.equal(garden.length, garden.stats.placements);
	for (const placement of garden) assertPlacement(placement);
}

assert.ok(gardens.low.length < gardens.medium.length);
assert.ok(gardens.medium.length < gardens.high.length);
assert.ok(gardens.high.length < gardens.cinematic.length);
assert.equal(gardens.high.length, 270);

console.log(JSON.stringify({
	ok: true,
	placements: Object.fromEntries(qualities.map((quality) => [quality, gardens[quality].length])),
	high: gardens.high.stats
}, null, 2));

function assertPlacement(placement) {
	assert.ok(Number.isInteger(placement.seed));
	assert.ok(Number.isFinite(placement.scale));
	assert.ok(Number.isFinite(placement.windPhase));
	assert.ok(['near', 'medium', 'far'].includes(placement.lodClass));
	assert.ok(['low', 'medium', 'high'].includes(placement.geometryQuality));
	assert.ok(['x', 'y', 'z'].every((axis) => Number.isFinite(placement.position[axis])));
	for (const clearing of VILLAGE_REFERENCE_CLEARINGS) {
		const distance = Math.hypot(
			placement.position.x - clearing.x,
			placement.position.z - clearing.z
		);
		assert.ok(distance >= clearing.radius, `${placement.species} entered ${clearing.id}`);
	}
}

function groundHeight(x, z) {
	return 0.8 + x * 0.002 + z * 0.003;
}
