// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file botanicalPatchPlanner.test.mjs
 * @description Proves new patch grammars are deterministic while the old radial cluster path remains exact.
 * The Awtsmoos renews every seed without erasing the path by which yesterday's meadow grew;
 * Awtsmoos.com tests new abundance against old identity so expansion remains faithful and true.
 */
import assert from 'node:assert/strict';
import { planBotanicalPatch } from '../src/core/geometry/generators/botany/BotanicalPatchPlanner.js';
import { BotanicalRandom, botanicalSeed } from '../src/core/geometry/generators/botany/BotanicalRandom.js';

const options = {
	count: 6,
	position: { x: 3, y: 1, z: -2 },
	radius: 4,
	seed: 917,
	species: 'daisy'
};
const first = planBotanicalPatch(options);
const second = planBotanicalPatch(options);
assert.deepEqual(first, second);

const legacySeed = botanicalSeed(options.species, options.seed, options.count, options.radius);
const legacyRandom = new BotanicalRandom(legacySeed);
assert.equal(first.seed, legacySeed);
for (let index = 0; index < options.count; index += 1) {
	const angle = index * 2.399 + legacyRandom.next(-0.18, 0.18);
	const fraction = Math.sqrt((index + 0.5) / options.count);
	const distance = options.radius * fraction * legacyRandom.next(0.82, 1.08);
	const expected = {
		x: options.position.x + Math.cos(angle) * distance,
		y: options.position.y,
		z: options.position.z + Math.sin(angle) * distance
	};
	assert.deepEqual(first.placements[index].position, expected);
	assert.equal(first.placements[index].seed, botanicalSeed(legacySeed, index));
}

const bandA = planBotanicalPatch({ ...options, distribution: 'band' });
const bandB = planBotanicalPatch({ ...options, distribution: 'band' });
assert.deepEqual(bandA, bandB);
assert.equal(bandA.distribution, 'band');
assert.notDeepEqual(bandA.placements, first.placements);

const filtered = planBotanicalPatch({
	...options,
	count: 8,
	distribution: 'meadow',
	environmentScore(position) {
		return position.x >= options.position.x ? 1 : 0;
	},
	minEnvironmentScore: 0.5
});
assert.ok(filtered.placements.length > 0);
assert.ok(filtered.placements.length <= 8);
assert.ok(filtered.placements.every((placement) => placement.position.x >= options.position.x));
assert.ok(filtered.placements.every((placement) => Object.isFrozen(placement)));

console.log('B"H | botanicalPatchPlanner.test passed');
