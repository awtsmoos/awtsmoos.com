// B"H
import assert from 'node:assert/strict';
import { FrameBudgetGovernor } from '../../performance/FrameBudgetGovernor.js';

const governor = new FrameBudgetGovernor({
	initialTier: 'high',
	maximumTier: 'high',
	warmupMilliseconds: 0,
	cooldownMilliseconds: 0,
	badWindowsRequired: 2,
	goodWindowsRequired: 2
});

const bad = snapshot({
	averageFps: 34,
	p95IntervalMilliseconds: 39,
	longFrameRate: 0.12
});
const good = snapshot({
	averageFps: 60,
	p95IntervalMilliseconds: 16.7,
	longFrameRate: 0
});

const firstPressure = governor.evaluate(bad, 0);
assert.equal(firstPressure.changed, false);
assert.equal(firstPressure.reason, 'collecting-pressure-evidence');

const reduced = governor.evaluate(bad, 1);
assert.equal(reduced.changed, true);
assert.equal(reduced.previousTier, 'high');
assert.equal(reduced.nextTier, 'medium');

const firstHeadroom = governor.evaluate(good, 2);
assert.equal(firstHeadroom.changed, false);
assert.equal(firstHeadroom.reason, 'collecting-headroom-evidence');

const restored = governor.evaluate(good, 3);
assert.equal(restored.changed, true);
assert.equal(restored.nextTier, 'high');

const boundaryOne = governor.evaluate(good, 4);
const boundaryTwo = governor.evaluate(good, 5);
assert.equal(boundaryOne.changed, false);
assert.equal(boundaryTwo.changed, false);
assert.equal(boundaryTwo.reason, 'tier-boundary');
assert.equal(governor.currentTier, 'high');
assert.equal(governor.decisions.length, 2);

const warming = new FrameBudgetGovernor({
	initialTier: 'medium',
	warmupMilliseconds: 1000,
	cooldownMilliseconds: 0,
	badWindowsRequired: 1
});
assert.equal(warming.evaluate(bad, 100).reason, 'warmup');
assert.equal(warming.evaluate(bad, 1100).changed, true);
assert.equal(warming.currentTier, 'low');

const incomplete = governor.evaluate({ ...bad, ready: false }, 6);
assert.equal(incomplete.reason, 'window-not-ready');

console.log(JSON.stringify({
	ok: true,
	decisions: governor.decisions,
	warmingTier: warming.currentTier
}, null, 2));

function snapshot(overrides) {
	return {
		ready: true,
		averageFps: 60,
		p95IntervalMilliseconds: 16.7,
		longFrameRate: 0,
		...overrides
	};
}
