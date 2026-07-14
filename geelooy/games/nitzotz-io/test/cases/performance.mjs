// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { compactActive } from '../../js/game/effects.js';
import { createPerformanceState, updatePerformance } from '../../js/performance.js';
import { visibleObjects } from '../../js/renderList/culling.js';
import { objectDetailTier } from '../../js/renderList/objects.js';
import { renderSettings } from '../../js/renderList/settings.js';
import { createWorld } from '../../js/state.js';

/**
 * The Awtsmoos creates every measured frame anew. Awtsmoos.com verifies fast
 * surrender under stress, patient recovery, and preservation of complete simulation.
 */
export function runPerformanceCases() {
	return [
		checkAdaptiveDegradation(),
		checkAdaptiveRecovery(),
		checkBoundedCulling(),
		checkRenderBudgetMonotonicity(),
		checkObjectDetailTiers(),
		checkInPlaceCompaction()
	];
}

function checkAdaptiveDegradation() {
	const performanceState = createPerformanceState();
	feedFrames(performanceState, 33, 48, 341);
	assert.ok(performanceState.p95 >= 32);
	assert.ok(performanceState.scale <= 0.35);
	assert.ok(performanceState.resolutionScale <= 0.65);
	assert.equal(performanceState.postfx, false);
	assert.ok(renderSettings('high', performanceState.scale).maxObjects <= 35);
	return {
		test: 'adaptive-degradation',
		p95: performanceState.p95,
		scale: performanceState.scale,
		resolutionScale: performanceState.resolutionScale
	};
}

function checkAdaptiveRecovery() {
	const performanceState = createPerformanceState();
	feedFrames(performanceState, 33, 48, 341);
	const stressedScale = performanceState.scale;
	feedFrames(performanceState, 16, 900, 72);
	assert.ok(performanceState.scale > stressedScale);
	assert.ok(performanceState.stress < 0.06);
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
	world.performance.scale = 0.22;
	const limit = renderSettings(world.save.perf, world.performance.scale).maxObjects;
	const visible = visibleObjects(world);
	assert.ok(visible.length <= limit);
	assert.ok(visible.every(object => Number.isFinite(object.renderPriority)));
	assert.equal(world.level.objects.length, 654);
	return { test: 'bounded-culling', visible: visible.length, limit, simulated: world.level.objects.length };
}

function checkRenderBudgetMonotonicity() {
	const profiles = ['low', 'medium', 'high'];
	const qualities = [0.22, 0.3, 0.6, 1];
	for (const profile of profiles) {
		const counts = qualities.map(value => renderSettings(profile, value).maxObjects);
		assert.deepEqual(counts, [...counts].sort((left, right) => left - right));
	}
	const stressedHigh = renderSettings('high', 0.3);
	assert.ok(stressedHigh.maxObjects >= 24);
	assert.ok(stressedHigh.maxObjects < 50);
	const full = profiles.map(profile => renderSettings(profile, 1).maxObjects);
	assert.ok(full[0] < full[1] && full[1] < full[2]);
	return { test: 'render-budget-monotonicity', stressedHigh, full };
}

function checkObjectDetailTiers() {
	assert.equal(objectDetailTier(0.22), 0);
	assert.equal(objectDetailTier(0.83), 0);
	assert.equal(objectDetailTier(0.84), 1);
	assert.equal(objectDetailTier(0.96), 1);
	assert.equal(objectDetailTier(0.97), 2);
	assert.equal(objectDetailTier(1), 2);
	return { test: 'object-detail-tiers', minimalBelow: 0.84, fullAt: 0.97 };
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
