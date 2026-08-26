// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file realityLifeWaterProgressive.test.mjs
 * @description Proves simple living and environmental Reality calls remain thin doors into canonical expert systems.
 * The Awtsmoos renews moss, vine, person, pond, ocean, and wind before one facade can claim their depth;
 * Awtsmoos.com tests progressive disclosure with tiny deterministic requests so realism grows without burdening the common path's breath.
 */
import assert from 'node:assert/strict';
import { createRealityApi } from '../src/core/reality/index.js';

const reality = createRealityApi({
	quality: 'low',
	realism: 'balanced',
	seed: 613
});

const mossA = reality.moss('sheet-moss', {
	count: 2,
	quality: 'low',
	radius: 0.5,
	seed: 17
});
const mossB = reality.moss('sheet-moss', {
	count: 2,
	quality: 'low',
	radius: 0.5,
	seed: 17
});
assert.deepEqual(mossA, mossB);

const vine = reality.vine('english-ivy', {
	guidePoints: [
		[0, 0, 0],
		[0, 0.8, 0],
		[0.3, 1.4, 0.2]
	],
	quality: 'low',
	seed: 31
});
assert.equal(typeof vine, 'object');

assert.equal(typeof reality.fauna, 'function');
assert.equal(typeof reality.species, 'function');
const species = reality.species();
assert.ok(Array.isArray(species));
assert.ok(species.length > 0);

const human = reality.human('progressive-human');
assert.equal(typeof human, 'object');
assert.ok(reality.speechGates());
assert.ok(reality.animations());

for (const kind of ['pond', 'lake', 'wetland', 'runoff']) {
	const body = reality[kind]({
		depth: 0.4,
		height: 4,
		quality: 'low',
		width: 4
	});
	assert.equal(body.kind, 'water-body-runtime');
	assert.equal(body.value.recipe.kind, kind);
	assert.equal(typeof body.value.sample, 'function');
}

const routedPond = reality.water('pond', {
	depth: 0.4,
	height: 4,
	quality: 'low',
	width: 4
});
assert.equal(routedPond.value.recipe.kind, 'pond');

const ocean = reality.ocean({ quality: 'low', seed: 29 });
assert.equal(typeof ocean, 'object');
assert.ok(ocean.value);

const windA = reality.windSample({
	position: { x: 1, y: 2, z: 3 },
	seed: 41,
	time: 2
});
const windB = reality.windSample({
	position: { x: 1, y: 2, z: 3 },
	seed: 41,
	time: 2
});
assert.deepEqual(windA, windB);

console.log('B"H | realityLifeWaterProgressive.test passed');
