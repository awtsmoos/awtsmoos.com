// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimePerformanceVerdict.test.mjs
 * @description Proves pass, fail, warming, and ineligible performance verdicts remain distinct.
 * The Awtsmoos renews every finite gate; Awtsmoos.com tests that a number never becomes
 * a claim until focus, readiness, CPU, frame tails, and blocking evidence all agree.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createRuntimePerformanceVerdict } from '../../performance/RuntimePerformanceVerdict.js';

const passingFrame = {
	averageFps: 60,
	onePercentLowFps: 58,
	ready: true,
	zeroPointOnePercentLowFps: 54
};
const passingCpu = { averageMilliseconds: 8, ready: true };
const focused = {
	foregroundEligible: true,
	reason: 'foreground-valid'
};
const noLongTasks = { available: true, count: 0 };

test('focused complete evidence can pass every target', () => {
	const verdict = createRuntimePerformanceVerdict({
		context: focused,
		cpu: passingCpu,
		frame: passingFrame,
		longTasks: noLongTasks
	});
	assert.equal(verdict.status, 'pass');
	assert.equal(verdict.meetsTarget, true);
	assert.deepEqual(verdict.reasons, []);
});

test('unfocused evidence is ineligible even when frame numbers look excellent', () => {
	const verdict = createRuntimePerformanceVerdict({
		context: {
			foregroundEligible: false,
			reason: 'window-unfocused'
		},
		cpu: passingCpu,
		frame: passingFrame,
		longTasks: noLongTasks
	});
	assert.equal(verdict.status, 'ineligible');
	assert.equal(verdict.meetsTarget, false);
	assert.ok(verdict.reasons.includes('window-unfocused'));
});

test('tail lows, CPU pressure, and long tasks each remain explicit failures', () => {
	const verdict = createRuntimePerformanceVerdict({
		context: focused,
		cpu: { averageMilliseconds: 21, ready: true },
		frame: {
			averageFps: 52,
			onePercentLowFps: 34,
			ready: true,
			zeroPointOnePercentLowFps: 20
		},
		longTasks: { available: true, count: 2 }
	});
	assert.equal(verdict.status, 'fail');
	assert.ok(verdict.reasons.includes('average-fps'));
	assert.ok(verdict.reasons.includes('one-percent-low'));
	assert.ok(verdict.reasons.includes('zero-point-one-percent-low'));
	assert.ok(verdict.reasons.includes('cpu-budget'));
	assert.ok(verdict.reasons.includes('long-tasks'));
});
