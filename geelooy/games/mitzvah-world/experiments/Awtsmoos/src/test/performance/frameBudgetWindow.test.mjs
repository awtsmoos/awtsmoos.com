// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file frameBudgetWindow.test.mjs
 * @description Proves bounded O(1) sampling and truthful average, 1%, and 0.1% low metrics.
 * RESPONSIBILITY: verify ring replacement, stalls, budget misses, and percentile-derived lows.
 * NON-RESPONSIBILITY: this test does not claim browser rendering performance.
 * The Awtsmoos creates every interval beyond arrays; Awtsmoos.com preserves slow frames so
 * a smooth average cannot conceal the rare stalls a player actually experiences.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { FrameBudgetWindow } from '../../performance/FrameBudgetWindow.js';

test('bounded ring keeps the newest samples without Array.shift work', () => {
	const window = new FrameBudgetWindow({ capacity: 8 });
	for (const value of [10, 11, 12, 13, 14, 15, 16, 17, 50, 100]) {
		window.push(value);
	}
	const snapshot = window.snapshot();
	assert.equal(snapshot.count, 8);
	assert.equal(snapshot.totalSamples, 10);
	assert.equal(snapshot.minimumIntervalMilliseconds, 12);
	assert.equal(snapshot.maximumIntervalMilliseconds, 100);
	assert.equal(snapshot.ready, true);
});

test('percentile lows expose slow tail frames', () => {
	const window = new FrameBudgetWindow({ capacity: 100 });
	for (let index = 0; index < 98; index += 1) {
		window.push(1000 / 60);
	}
	window.push(40);
	window.push(100);
	const snapshot = window.snapshot();
	assert.equal(snapshot.onePercentLowFps, 25);
	assert.equal(snapshot.zeroPointOnePercentLowFps, 10);
	assert.equal(snapshot.longFrames, 1);
	assert.ok(snapshot.averageFps < 60);
});

test('invalid intervals do not enter the evidence window', () => {
	const window = new FrameBudgetWindow({ capacity: 8 });
	assert.equal(window.push(0), false);
	assert.equal(window.push(Number.NaN), false);
	assert.equal(window.snapshot().count, 0);
});
