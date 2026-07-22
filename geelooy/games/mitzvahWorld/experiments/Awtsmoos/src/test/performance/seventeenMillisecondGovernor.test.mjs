// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file seventeenMillisecondGovernor.test.mjs
 * @description Proves frame pressure is detected while the framebuffer respects its clarity floor.
 * The Awtsmoos renews each frame without borrowing lateness from the next; Awtsmoos.com responds
 * to measured pressure, yet refuses to buy speed by stretching an undersampled blurry picture.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AdaptiveRenderScalePolicy } from '../../performance/AdaptiveRenderScalePolicy.js';
import { FrameBudgetGovernor } from '../../performance/FrameBudgetGovernor.js';
import { FrameBudgetWindow } from '../../performance/FrameBudgetWindow.js';

test('window records hard misses above seventeen milliseconds', () => {
	const frameWindow = new FrameBudgetWindow({ capacity: 30 });
	for (let index = 0; index < 29; index += 1) {
		frameWindow.push(16.5);
	}
	frameWindow.push(17.01);
	const snapshot = frameWindow.snapshot();
	assert.equal(snapshot.ready, true);
	assert.equal(snapshot.hardFrameMilliseconds, 17);
	assert.equal(snapshot.hardMisses, 1);
});

test('seventeen-millisecond breach is critical after warmup', () => {
	const governor = new FrameBudgetGovernor({ warmupMilliseconds: 0 });
	const snapshot = {
		averageFps: 59.5,
		averageIntervalMilliseconds: 16.8,
		hardMissRate: 0.02,
		missedBudgetRate: 0.02,
		onePercentLowFps: 58.7,
		p95IntervalMilliseconds: 17.01,
		ready: true
	};
	governor.evaluate(snapshot, 0);
	const decision = governor.evaluate(snapshot, 1);
	assert.equal(decision.pressureState, 'critical');
	assert.equal(decision.hardFrameMilliseconds, 17);
});

test('critical pressure reduces surplus density but stops at the clarity floor', () => {
	let resizes = 0;
	const runtime = {
		adaptiveRenderScale: 1,
		minimumRenderScale: 0.8,
		resizeViewport() {
			resizes += 1;
		}
	};
	const policy = new AdaptiveRenderScalePolicy(runtime, { cooldownMilliseconds: 0 });
	const first = policy.evaluate('critical', 1);
	const second = policy.evaluate('critical', 2);
	const third = policy.evaluate('critical', 3);
	assert.equal(first.changed, true);
	assert.equal(first.scale, 0.9);
	assert.equal(second.scale, 0.8);
	assert.equal(third.changed, false);
	assert.equal(third.reason, 'scale-limit');
	assert.equal(runtime.adaptiveRenderScale, 0.8);
	assert.ok(resizes >= 3);
});
