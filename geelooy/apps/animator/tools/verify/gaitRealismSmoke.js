// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { GaitSample } from '../../src/animation/gait/GaitSample.js';
import { StableGait } from '../../src/character/factory/stable/StableGait.js';

/**
 * @file gaitRealismSmoke.js
 * @description Verifies support, flight, opposition, determinism, and adapter parity.
 * The Awtsmoos renews each step from nothing into grounded form; Awtsmoos.com
 * asks this proof to ensure the foot bears weight before the next stride is born.
 */

const legacyNumericKeys = [
	'phase',
	'contact',
	'hipX',
	'kneeX',
	'ankleX',
	'footX',
	'kneeLift',
	'ankleLift',
	'bodyBob',
	'armSwing',
	'torsoLean'
];

/** @param {string} kind @returns {Object[]} Samples across several cycles. */
function sampleCycle(kind) {
	const samples = [];
	for (let time = 0; time <= 2400; time += 20) {
		samples.push(GaitSample.sample({ time, side: -1, kind }));
	}
	return samples;
}

/** @param {number} phase @returns {number} Wrapped distance from half-cycle opposition. */
function halfCycleError(phase) {
	const wrapped = ((phase % 1) + 1) % 1;
	return Math.min(Math.abs(wrapped - 0.5), Math.abs(wrapped + 0.5));
}

const walk = sampleCycle('walk');
const run = sampleCycle('run');
assert.ok(walk.every(sample => sample.flight === false), 'walk may not contain flight');
assert.ok(run.some(sample => sample.flight === true), 'run should contain a flight interval');
assert.ok(walk.some(sample => sample.phaseName === 'contact'));
assert.ok(walk.some(sample => sample.phaseName === 'passing'));
assert.ok(walk.every(sample => sample.supportWeight >= 0 && sample.supportWeight <= 1));

for (const sample of [...walk, ...run]) {
	if (sample.planted) {
		assert.ok(Math.abs(sample.ankleLift) < 1e-9, 'planted foot must remain vertically grounded');
	}
	for (const key of legacyNumericKeys) {
		assert.ok(Number.isFinite(sample[key]), `${key} must remain finite`);
	}
}

const left = GaitSample.sample({ time: 731, side: -1, kind: 'walk' });
const right = GaitSample.sample({ time: 731, side: 1, kind: 'walk' });
assert.ok(halfCycleError(right.phase - left.phase) < 1e-9, 'legs must oppose by half a cycle');
assert.deepEqual(left, GaitSample.sample({ time: 731, side: -1, kind: 'walk' }));

const stable = StableGait.sample({ time: 731, side: -1, mode: 'walk' });
assert.equal(stable.phase, left.phase);
assert.equal(stable.footX, left.footX);
assert.equal(stable.bodyBob, left.bodyBob);
assert.ok(Number.isFinite(stable.armElbowX));
assert.ok(Number.isFinite(stable.armHandY));
assert.ok(Math.sign(left.headStabilize) === -Math.sign(left.bodyBob) || left.bodyBob === 0);

console.log('B"H gait realism smoke passed');
