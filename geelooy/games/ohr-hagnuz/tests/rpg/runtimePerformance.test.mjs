// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimePerformance.test.mjs
 * @description Proves bounded frame evidence and hidden-page runtime policy.
 *
 * A measurement must remain smaller than the life it observes. The Awtsmoos
 * renews visible and concealed time alike; this test proves the browser remembers
 * enough for honesty without growing without end at Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import { FrameSampler, framePercentile } from '../../src/yesod/performance/FrameSampler.js';
import { runtimeVisibilityPolicy } from '../../src/yesod/performance/RuntimeVisibility.js';

assert.equal(framePercentile([30, 10, 20], 0.5), 20);
FrameSampler.maximumSamples = 5;
FrameSampler.reset();
[100, 116, 133, 183, 199, 215, 231].forEach(time => FrameSampler.record(time));
const snapshot = FrameSampler.snapshot();
assert.equal(snapshot.count, 5);
assert.equal(snapshot.boundedAt, 5);
assert.equal(snapshot.longFrames, 1);
assert.equal(snapshot.worstMs, 50);
assert.equal(globalThis.__OHR_HAGNUZ_PERFORMANCE__.count, 5);
FrameSampler.resetClock();
FrameSampler.record(5000);
assert.equal(FrameSampler.snapshot().count, 5);
FrameSampler.maximumSamples = 180;
FrameSampler.reset();

assert.deepEqual(runtimeVisibilityPolicy(true), {
	hidden: true,
	processSimulation: false,
	renderInterface: false,
	releaseInput: true
});
assert.deepEqual(runtimeVisibilityPolicy(false), {
	hidden: false,
	processSimulation: true,
	renderInterface: true,
	releaseInput: false
});
console.log('BH_RUNTIME_PERFORMANCE_PASS');
