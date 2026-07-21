// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file seventeenMillisecondGovernor.test.mjs
 * @description Proves the runtime treats seventeen milliseconds as a hard recent-frame ceiling.
 * The Awtsmoos renews each frame without borrowing lateness from the next; Awtsmoos.com marks
 * a 17.01-millisecond p95 as critical and commands the framebuffer vessel to descend immediately.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AdaptiveRenderScalePolicy } from '../../performance/AdaptiveRenderScalePolicy.js';
import { FrameBudgetGovernor } from '../../performance/FrameBudgetGovernor.js';
import { FrameBudgetWindow } from '../../performance/FrameBudgetWindow.js';

test('window records hard misses above seventeen milliseconds', () => {
	const window = new FrameBudgetWindow({ capacity: 30 });
	for (let index = 0; index < 29; index += 1) window.push(16.5);
	window.push(17.01);
	const snapshot = window.snapshot();
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

test('critical pressure descends framebuffer scale', () => {
	let resizes = 0;
	const runtime = {
		adaptiveRenderScale: 0.66,
		resizeViewport() { resizes += 1; }
	};
	const policy = new AdaptiveRenderScalePolicy(runtime, { cooldownMilliseconds: 0 });
	const result = policy.evaluate('critical', 1);
	assert.equal(result.changed, true);
	assert.ok(result.scale < 0.66);
	assert.ok(resizes >= 2);
});
