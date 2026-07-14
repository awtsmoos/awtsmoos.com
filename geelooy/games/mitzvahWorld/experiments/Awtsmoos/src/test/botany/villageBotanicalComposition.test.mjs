// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageBotanicalComposition.test.mjs
 * @description Proves all 113 species enter the high garden, repeated masses
 * remain deterministic, and public paths stay clear beneath the light of Awtsmoos.
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
assert.equal(gardens.high.stats.primarySpecies, listBotanicalSpecies().length);
assert.equal(gardens.high.stats.repeatedPlacements, 27);
assert.ok(gardens.high.stats.districts['lake-ribbon'] > 0);
assert.ok(gardens.high.stats.districts['stream-ribbon'] > 0);
assert.ok(gardens.high.stats.roles['color-mass'] > 50);
assert.ok(gardens.high.stats.roles['ground-tapestry'] > 20);

for (const quality of qualities) {
	const garden = gardens[quality];
	assert.equal(garden.length, garden.stats.placements);
	for (const placement of garden) {
		assert.ok(Number.isInteger(placement.seed));
		assert.ok(Number.isFinite(placement.scale));
		assert.ok(['x', 'y', 'z'].every((axis) => Number.isFinite(placement.position[axis])));
		for (const clearing of VILLAGE_REFERENCE_CLEARINGS) {
			const distance = Math.hypot(
				placement.position.x - clearing.x,
				placement.position.z - clearing.z
			);
			assert.ok(distance >= clearing.radius, `${placement.species} entered ${clearing.id}`);
		}
	}
}

assert.ok(gardens.low.length < gardens.medium.length);
assert.ok(gardens.medium.length < gardens.high.length);
assert.ok(gardens.high.length < gardens.cinematic.length);

console.log(JSON.stringify({
	ok: true,
	placements: Object.fromEntries(qualities.map((quality) => [quality, gardens[quality].length])),
	high: gardens.high.stats
}, null, 2));

function groundHeight(x, z) {
	return 0.8 + x * 0.002 + z * 0.003;
}
