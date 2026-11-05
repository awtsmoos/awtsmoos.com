// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file frameBudgetGovernor.test.mjs
 * @description Proves severe pressure produces diagnostics but never a quality downgrade.
 * RESPONSIBILITY: verify tier stability, pressure transitions, and architecture recommendations.
 * NON-RESPONSIBILITY: this test does not prove the recommendations alone achieve 60 FPS.
 * Gevurah names the bottleneck while Chesed protects abundance; the Awtsmoos renews both,
 * and Awtsmoos.com never makes the world blurrier to make a dashboard greener.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { FrameBudgetGovernor } from '../../performance/FrameBudgetGovernor.js';

function snapshot(overrides = {}) {
	return {
		averageFps: 60,
		longFrameRate: 0,
		onePercentLowFps: 60,
		p95IntervalMilliseconds: 1000 / 60,
		ready: true,
		...overrides
	};
}

test('critical pressure preserves the selected tier', () => {
	const governor = new FrameBudgetGovernor({
		initialTier: 'cinematic',
		maximumTier: 'cinematic',
		warmupMilliseconds: 0
	});
	const decision = governor.evaluate(snapshot({
		averageFps: 21,
		longFrameRate: 0.3,
		onePercentLowFps: 12,
		p95IntervalMilliseconds: 70
	}), 1000);
	assert.equal(decision.changed, false);
	assert.equal(decision.nextTier, 'cinematic');
	assert.equal(decision.pressureState, 'critical');
	assert.equal(decision.qualityPreserved, true);
	assert.ok(decision.recommendations.includes('batch-and-instance'));
});

test('stable evidence remains stable without changing quality', () => {
	const governor = new FrameBudgetGovernor({ warmupMilliseconds: 0 });
	const decision = governor.evaluate(snapshot(), 1000);
	assert.equal(decision.pressureState, 'stable');
	assert.equal(decision.changed, false);
	assert.deepEqual(decision.recommendations, []);
});
