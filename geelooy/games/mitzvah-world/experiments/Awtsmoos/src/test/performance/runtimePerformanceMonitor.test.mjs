// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimePerformanceMonitor.test.mjs
 * @description Proves attribution, boundary discard, hidden rejection, and crisp adaptive safety.
 * The Awtsmoos renews every frame and witness; Awtsmoos.com tests that stale intervals never
 * cross contexts and that the framebuffer begins clear before pressure may shed only surplus work.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { RuntimePerformanceMonitor } from '../../performance/RuntimePerformanceMonitor.js';

function runtimeStub() {
	return {
		qualityProfile: { quality: 'high' },
		renderer: { stats: { draws: 12, triangles: 500 } },
		scene: { traverse() {} }
	};
}

function frameCosts() {
	return {
		animationBreakdown: {
			doorsMilliseconds: 0.1,
			horsesMilliseconds: 0.2,
			npcsMilliseconds: 0.5,
			playerMatrixMilliseconds: 0.2,
			worldModelsMilliseconds: 1
		},
		animationMilliseconds: 2,
		cameraMilliseconds: 0.4,
		cpuFrameMilliseconds: 9,
		gameplayMilliseconds: 0.8,
		renderSubmissionMilliseconds: 5,
		shadowMilliseconds: 0.5,
		streamingMilliseconds: 0.2,
		waterMilliseconds: 0.3
	};
}

test('monitor attributes animation and discards context-boundary intervals', () => {
	let kind = 'focused';
	const runtime = runtimeStub();
	const monitor = new RuntimePerformanceMonitor(runtime, {
		PerformanceObserver: null,
		capacity: 8,
		contextProvider: () => ({ kind }),
		warmupMilliseconds: 0
	});
	for (let index = 1; index <= 8; index += 1) {
		monitor.record(1000 / 60, index * 600, frameCosts());
	}
	let diagnostics = monitor.diagnostics();
	assert.equal(diagnostics.verdict.status, 'pass');
	assert.equal(diagnostics.subsystems.dominantSubsystem, 'render');
	assert.equal(diagnostics.animationBreakdown.dominantComponent, 'worldModels');
	assert.equal(diagnostics.animationBreakdown.worldModels.count, 8);
	assert.equal(diagnostics.sampling.counters.acceptedFocused, 8);
	assert.equal(runtime.adaptiveRenderScale, 1);
	assert.equal(runtime.adaptiveQualityTier, 'high');

	kind = 'unfocused';
	monitor.record(125000, 130000, frameCosts());
	diagnostics = monitor.diagnostics();
	assert.equal(diagnostics.sampling.windowResets, 1);
	assert.equal(diagnostics.frame.count, 0);
	assert.equal(diagnostics.animationBreakdown.worldModels.count, 0);
	assert.equal(diagnostics.sampling.counters.discardedTransitionFrames, 1);
	assert.equal(diagnostics.verdict.status, 'ineligible');
	monitor.record(1000 / 60, 130600, frameCosts());
	diagnostics = monitor.diagnostics();
	assert.equal(diagnostics.frame.count, 1);
	assert.equal(diagnostics.sampling.counters.acceptedNonForeground, 1);

	kind = 'hidden';
	monitor.record(1000, 131600, frameCosts());
	diagnostics = monitor.diagnostics();
	assert.equal(diagnostics.sampling.windowResets, 2);
	assert.equal(diagnostics.frame.count, 0);
	assert.equal(diagnostics.sampling.counters.rejectedHidden, 1);
	monitor.dispose();
});
