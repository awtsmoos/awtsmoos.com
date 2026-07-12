// B"H
import assert from 'node:assert/strict';
import { FrameBudgetWindow } from '../../performance/FrameBudgetWindow.js';

const window = new FrameBudgetWindow({
	capacity: 8,
	targetFrameMilliseconds: 16,
	longFrameMilliseconds: 40
});

assert.equal(window.push(NaN), false);
assert.equal(window.push(0), false);
for (const value of [10, 12, 14, 16, 18, 20, 40, 80]) {
	assert.equal(window.push(value), true);
}

const first = window.snapshot();
assert.equal(first.ready, true);
assert.equal(first.count, 8);
assert.equal(first.p50IntervalMilliseconds, 16);
assert.equal(first.p95IntervalMilliseconds, 80);
assert.equal(first.maximumIntervalMilliseconds, 80);
assert.equal(first.longFrames, 2);
assert.equal(first.longFrameRate, 0.25);
assert.equal(first.missedBudgetFrames, 4);
assert.equal(first.totalSamples, 8);

window.push(8);
const rolling = window.snapshot();
assert.equal(rolling.count, 8, 'window should remain bounded');
assert.equal(rolling.minimumIntervalMilliseconds, 8);
assert.equal(rolling.maximumIntervalMilliseconds, 80);
assert.equal(rolling.totalSamples, 9);
assert.ok(rolling.averageFps > 0);

window.clear();
const cleared = window.snapshot();
assert.equal(cleared.count, 0);
assert.equal(cleared.ready, false);
assert.equal(cleared.totalSamples, 9, 'clear should preserve lifetime evidence');

console.log(JSON.stringify({
	ok: true,
	first,
	rolling,
	cleared
}, null, 2));
