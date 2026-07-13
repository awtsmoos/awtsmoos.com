// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { compactActive } from '../../js/game/effects.js';
import { createPerformanceState, updatePerformance } from '../../js/performance.js';
import { visibleObjects } from '../../js/renderList/culling.js';
import { renderSettings } from '../../js/renderList/settings.js';
import { createWorld } from '../../js/state.js';

/**
 * The Awtsmoos creates every measured frame anew; these regressions ensure the
 * finite quality vessel degrades, recovers, and reuses memory without deception.
 */
export function runPerformanceCases() {
	return [
		checkAdaptiveDegradation(),
		checkAdaptiveRecovery(),
		checkBoundedCulling(),
		checkInPlaceCompaction()
	];
}

function checkAdaptiveDegradation() {
	const performanceState = createPerformanceState();
	feedFrames(performanceState, 30, 180, 420);
	assert.ok(performanceState.p95 >= 29);
	assert.ok(performanceState.scale < 0.7);
	assert.ok(performanceState.resolutionScale < 1);
	assert.equal(performanceState.postfx, false);
	return {
		test: 'adaptive-degradation',
		p95: performanceState.p95,
		scale: performanceState.scale,
		resolutionScale: performanceState.resolutionScale
	};
}

function checkAdaptiveRecovery() {
	const performanceState = createPerformanceState();
	feedFrames(performanceState, 30, 180, 420);
	const stressedScale = performanceState.scale;
	feedFrames(performanceState, 16, 900, 120);
	assert.ok(performanceState.scale > stressedScale);
	assert.ok(performanceState.stress < 0.24);
	assert.equal(performanceState.resolutionScale, 1);
	assert.equal(performanceState.postfx, true);
	return {
		test: 'adaptive-recovery',
		stress: performanceState.stress,
		scale: performanceState.scale
	};
}

function checkBoundedCulling() {
	const world = createWorld();
	world.save.perf = 'high';
	world.performance.scale = 0.38;
	const limit = renderSettings(world.save.perf, world.performance.scale).maxObjects;
	const visible = visibleObjects(world);
	assert.ok(visible.length <= limit);
	assert.ok(visible.every(object => Number.isFinite(object.renderPriority)));
	return { test: 'bounded-culling', visible: visible.length, limit };
}

function checkInPlaceCompaction() {
	const entries = [{ life: 1 }, { life: 0 }, { life: 2 }];
	const reference = entries;
	compactActive(entries, 0, entry => entry.life > 0);
	assert.equal(entries, reference);
	assert.deepEqual(entries, [{ life: 1 }, { life: 2 }]);
	return { test: 'in-place-compaction', remaining: entries.length };
}

function feedFrames(performanceState, milliseconds, count, commands) {
	for (let frame = 0; frame < count; frame += 1) {
		performanceState.frame += 1;
		updatePerformance(performanceState, milliseconds / 1000, commands);
	}
}
