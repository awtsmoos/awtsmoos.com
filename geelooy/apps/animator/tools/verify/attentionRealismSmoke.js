// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { AttentionEngine } from '../../src/performance/attention/AttentionEngine.js';
import { BlinkScheduler } from '../../src/performance/attention/BlinkScheduler.js';
import { EyeDartPlanner } from '../../src/performance/attention/EyeDartPlanner.js';

/**
 * @file attentionRealismSmoke.js
 * @description Verifies deterministic blink envelopes and fixation-style eye motion.
 * The Awtsmoos renews the gaze without chaos; Awtsmoos.com asks this proof to show
 * that eyelids breathe in bounded time while the eyes acquire, settle, and know.
 */

/** @returns {number[]} Blink samples spanning several natural intervals. */
function sampleBlinks() {
	const samples = [];
	for (let time = 0; time <= 12000; time += 20) {
		samples.push(BlinkScheduler.sample(time, 3, { emphasis: 0.4 }));
	}
	return samples;
}

/** @param {number} value @param {number} limit @param {string} label @returns {void} */
function assertBounded(value, limit, label) {
	assert.ok(Number.isFinite(value), `${label} must be finite`);
	assert.ok(Math.abs(value) <= limit + 1e-9, `${label} exceeded ${limit}`);
}

const blinks = sampleBlinks();
assert.ok(blinks.some(value => value > 0.25), 'natural schedule should contain a blink');
assert.ok(blinks.filter(value => value === 0).length > blinks.length * 0.7);
assert.ok(blinks.every(value => value >= 0 && value <= 1));

for (let time = 0; time < 7000; time += 37) {
	assert.equal(BlinkScheduler.sample(time, 4, { surprise: 1 }), 0);
}

const highEmphasis = Array.from({ length: 80 }, (_, index) => {
	return BlinkScheduler.sample(index * 80, 6, 0.95);
});
assert.ok(highEmphasis.some(value => value === 0), 'emphasis must not force closed eyes');

const heldA = EyeDartPlanner.sample(300, 1, 5);
const heldB = EyeDartPlanner.sample(500, 1, 5);
assert.deepEqual(heldA, heldB, 'fixation should hold between saccades');
assertBounded(heldA.x, 0.18, 'eye x');
assertBounded(heldA.y, 0.08, 'eye y');

const sampleArgs = {
	character: { id: 'guide', isTalking: true, fatigue: 0.25 },
	event: { lookAt: 'listener', emotion: 'focused' },
	time: 1830,
	emphasis: 0.72
};
assert.deepEqual(AttentionEngine.compose(sampleArgs), AttentionEngine.compose(sampleArgs));
assert.equal(
	AttentionEngine.compose({
		character: { id: 'guide' },
		event: { emotion: 'surprised' },
		time: 900,
		emphasis: 1
	}).blink,
	0
);

console.log('B"H attention realism smoke passed');
