// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimePerformanceEvidence.test.mjs
 * @description Proves quality preservation and honest runtime performance evidence.
 * The Awtsmoos creates world and witness anew; Awtsmoos.com requires explicit focused
 * context, measured tails, and intact quality before sixty-frame testimony may be accepted.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { QUALITY_TIERS } from '../../performance/QualityTier.js';
import { RuntimePerformanceMonitor } from '../../performance/RuntimePerformanceMonitor.js';
import { RuntimeResourceSnapshot } from '../../performance/RuntimeResourceSnapshot.js';
import { worldQualityProfile } from '../../performance/WorldQualityProfile.js';

test('every tier preserves full internal resolution and world distance', () => {
	for (const tier of Object.values(QUALITY_TIERS)) {
		assert.ok(tier.internalResolutionScale >= 1);
		assert.ok(tier.decorativeDistanceScale >= 1);
		assert.ok(tier.vegetationDistanceScale >= 1);
	}
	const low = worldQualityProfile('low');
	const high = worldQualityProfile('high');
	assert.equal(low.maxDpr, high.maxDpr);
	assert.equal(low.renderDistance, high.renderDistance);
	assert.equal(low.modelLimit, high.modelLimit);
});

test('resource sampler counts unique vessels and marks unavailable evidence honestly', () => {
	const texture = { image: { height: 8, width: 16 }, isTexture: true };
	const material = { map: texture };
	const objects = [
		{ geometry: { index: { count: 6 } }, material },
		{ geometry: { attributes: { position: { count: 9 } } }, material }
	];
	const runtime = {
		renderer: { stats: { draws: 7 } },
		scene: { traverse(callback) { objects.forEach(callback); } }
	};
	const snapshot = new RuntimeResourceSnapshot().collect(runtime, {
		animationMilliseconds: 1.5,
		cpuFrameMilliseconds: 8,
		shadowMilliseconds: 0.7,
		streamingMilliseconds: 0.5,
		waterMilliseconds: 0.2
	}, 5000);
	assert.equal(snapshot.activeMaterials, 1);
	assert.equal(snapshot.textureCount, 1);
	assert.equal(snapshot.objectCount, 2);
	assert.equal(snapshot.triangles, 5);
	assert.equal(snapshot.drawCalls, 7);
	assert.equal(snapshot.gpuFrameTime.available, false);
	assert.equal(snapshot.garbageCollection.available, false);
});

test('monitor requires focused average and tail lows before target success', () => {
	const runtime = {
		qualityProfile: { quality: 'high' },
		renderer: { stats: { draws: 4, triangles: 120 } },
		scene: { traverse() {} }
	};
	const monitor = new RuntimePerformanceMonitor(runtime, {
		PerformanceObserver: null,
		capacity: 8,
		contextProvider: () => ({ kind: 'focused' }),
		warmupMilliseconds: 0
	});
	for (let index = 1; index <= 8; index += 1) {
		monitor.record(1000 / 60, index * 600, {
			cpuFrameMilliseconds: 7,
			renderSubmissionMilliseconds: 3
		});
	}
	let diagnostics = monitor.diagnostics();
	assert.equal(diagnostics.meets60Target, true);
	assert.equal(diagnostics.verdict.status, 'pass');
	assert.equal(diagnostics.governor.qualityPreserved, true);
	assert.equal(runtime.adaptiveRenderScale, 1);
	monitor.record(100, 6000, {
		cpuFrameMilliseconds: 60,
		renderSubmissionMilliseconds: 45
	});
	diagnostics = monitor.diagnostics();
	assert.equal(diagnostics.meets60Target, false);
	assert.equal(diagnostics.verdict.status, 'fail');
	assert.equal(runtime.adaptiveRenderScale, 1);
	monitor.dispose();
});
