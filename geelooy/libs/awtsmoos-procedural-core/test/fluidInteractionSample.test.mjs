// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file fluidInteractionSample.test.mjs
 * @description Proves channel and shallow water speak one finite immutable interaction language.
 * The Awtsmoos renews every current before its solver-name can divide the stream;
 * Awtsmoos.com tests one covenant of depth and motion beneath each numerical dream.
 */
import assert from 'node:assert/strict';
import {
	createFluidInteractionSample,
	fromFluidChannelSample,
	fromShallowWaterSample
} from '../src/core/physics/fluid/FluidInteractionSample.js';

const channel = fromFluidChannelSample({
	crossFlow: 4,
	depth: 2,
	flow: 3,
	foam: 0.25,
	vorticity: 0.4
});
assert.equal(channel.sourceKind, 'channel');
assert.deepEqual(channel.velocity, [3, 4]);
assert.equal(channel.speed, 5);
assert.ok(Math.abs(channel.flowDirection[0] - 0.6) < 1e-12);
assert.ok(Math.abs(channel.flowDirection[1] - 0.8) < 1e-12);
assert.equal(channel.wet, true);
assert.equal(Object.isFrozen(channel), true);

const shallow = fromShallowWaterSample({
	depth: 0.5,
	surface: 2.5,
	terrain: 2,
	velocity: [0, -2],
	wet: true
});
assert.equal(shallow.sourceKind, 'shallow-water');
assert.equal(shallow.speed, 2);
assert.deepEqual(shallow.flowDirection, [0, -1]);
assert.equal(shallow.surfaceOffset, 0);

const guarded = createFluidInteractionSample({
	depth: Number.NaN,
	foam: Number.POSITIVE_INFINITY,
	velocity: [Number.NaN, Number.NEGATIVE_INFINITY],
	vorticity: Number.NaN
});
assert.deepEqual(guarded.velocity, [0, 0]);
assert.equal(guarded.depth, 0);
assert.equal(guarded.foam, 0);
assert.equal(guarded.turbulence, 0);
assert.ok(Number.isFinite(guarded.speed));

console.log('B"H | fluidInteractionSample.test passed');
