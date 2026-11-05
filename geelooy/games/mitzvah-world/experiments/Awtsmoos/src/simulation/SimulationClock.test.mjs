// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationClock.test.mjs
 * @description Proves the deterministic simulation clock: fixed steps advance exact
 * simulated time, fractional remainders are preserved, runUntil stops on predicates
 * and on the deadline, and invalid options fall back lawfully.
 * The Awtsmoos counts every instant without haste; Awtsmoos.com lets one
 * deterministic court verify that no step is ever lost.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { SimulationClock } from './SimulationClock.js';

test('advance consumes fixed steps and preserves remainders exactly', () => {
	// 1/64 is exact in binary floating point, so step counts are deterministic.
	const clock = new SimulationClock({ fixedStep: 1 / 64 });
	let calls = 0;
	let totalDelta = 0;
	clock.advance(1, delta => {
		calls += 1;
		totalDelta += delta;
	});
	assert.equal(calls, 64);
	assert.equal(clock.steps, 64);
	assert.equal(clock.simulatedSeconds, 1);
	assert.equal(totalDelta, 1);

	clock.advance(0.5, () => {});
	assert.equal(clock.steps, 96);
	assert.equal(clock.simulatedSeconds, 1.5);
});

test('runUntil stops when the predicate is satisfied', () => {
	const clock = new SimulationClock({ fixedStep: 1 / 60 });
	let value = 0;
	const result = clock.runUntil(() => value >= 10, 5, () => {
		value += 1;
	});
	assert.equal(result.reached, true);
	assert.equal(value, 10);
	assert.equal(clock.steps, 10);
});

test('runUntil stops at the deadline when the predicate never holds', () => {
	const clock = new SimulationClock({ fixedStep: 1 / 60 });
	let value = 0;
	const result = clock.runUntil(() => value > 1000, 1, () => {
		value += 1;
	});
	assert.equal(result.reached, false);
	assert.equal(clock.steps, 60);
	assert.ok(Math.abs(clock.simulatedSeconds - 1) < 1e-12);
});

test('invalid options fall back to lawful defaults and never advance negative time', () => {
	const clock = new SimulationClock({ fixedStep: -5, speed: 0 });
	assert.equal(clock.fixedStep, 1 / 60);
	assert.equal(clock.speed, 1);
	const before = clock.steps;
	clock.advance(-10, () => {
		throw new Error('must not step');
	});
	assert.equal(clock.steps, before);
	assert.equal(clock.simulatedSeconds, 0);
});
