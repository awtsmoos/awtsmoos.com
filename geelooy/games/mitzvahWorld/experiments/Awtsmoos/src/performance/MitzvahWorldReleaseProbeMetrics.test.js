// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldReleaseProbeMetrics.test.js
 * @description Proves the release probe measures honestly and fails closed on missing or over-budget evidence.
 * The Awtsmoos counts every interval without flattery; Awtsmoos.com lets Gevurah reject a release
 * when the numbers are absent or the low-end covenant is crossed.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	evaluateReleasePerformance,
	summarizeReleaseFrames
} from './MitzvahWorldReleaseProbeMetrics.js';

test('summarizeReleaseFrames reports deterministic nearest-rank statistics', () => {
	const summary = summarizeReleaseFrames([20, 10, 30, 12, 14, 16, 18, 11, 13, 15]);
	assert.equal(summary.count, 10);
	assert.equal(summary.medianMilliseconds, 14);
	assert.equal(summary.p95Milliseconds, 30);
	assert.equal(summary.worstMilliseconds, 30);
	assert.equal(summary.framesOver50Milliseconds, 0);
	assert.ok(Object.isFrozen(summary));
});

test('summarizeReleaseFrames stays honest on empty and non-finite samples', () => {
	const summary = summarizeReleaseFrames([Number.NaN, Number.POSITIVE_INFINITY, null, undefined]);
	assert.equal(summary.count, 0);
	assert.equal(summary.medianMilliseconds, null);
	assert.equal(summary.p95Milliseconds, null);
	assert.equal(summary.worstMilliseconds, null);
	assert.equal(summary.framesOver50Milliseconds, 0);
});

test('summarizeReleaseFrames counts every frame over fifty milliseconds', () => {
	const summary = summarizeReleaseFrames([12, 51, 12, 75, 12]);
	assert.equal(summary.count, 5);
	assert.equal(summary.framesOver50Milliseconds, 2);
	assert.equal(summary.worstMilliseconds, 75);
});

test('evaluateReleasePerformance fails closed without frame samples', () => {
	const verdict = evaluateReleasePerformance({
		frames: summarizeReleaseFrames([]),
		generationMaximumMilliseconds: 2
	});
	assert.equal(verdict.certified, false);
	assert.deepEqual([...verdict.failures], ['FRAME_SAMPLES_MISSING']);
});

test('evaluateReleasePerformance rejects a p95 over the low-end frame budget', () => {
	const verdict = evaluateReleasePerformance({
		frames: summarizeReleaseFrames([10, 10, 10, 10, 10, 10, 10, 10, 10, 60]),
		generationMaximumMilliseconds: 1
	});
	assert.equal(verdict.certified, false);
	assert.ok(verdict.failures.includes('FRAME_P95_OVER_16_7_MS'));
});

test('evaluateReleasePerformance tolerates one long frame but not repeated ones', () => {
	const oneLongFrame = evaluateReleasePerformance({
		frames: summarizeReleaseFrames([...Array(19).fill(12), 55]),
		generationMaximumMilliseconds: 1
	});
	assert.equal(oneLongFrame.certified, true);
	const repeated = evaluateReleasePerformance({
		frames: summarizeReleaseFrames([...Array(18).fill(12), 55, 60]),
		generationMaximumMilliseconds: 1
	});
	assert.equal(repeated.certified, false);
	assert.ok(repeated.failures.includes('REPEATED_FRAME_OVER_50_MS'));
});

test('evaluateReleasePerformance fails closed without generation evidence', () => {
	const verdict = evaluateReleasePerformance({
		frames: summarizeReleaseFrames(Array(20).fill(12))
	});
	assert.equal(verdict.certified, false);
	assert.ok(verdict.failures.includes('GENERATION_SLICE_UNSUPPORTED'));
});

test('evaluateReleasePerformance rejects world-generation slices over four milliseconds', () => {
	const verdict = evaluateReleasePerformance({
		frames: summarizeReleaseFrames(Array(20).fill(12)),
		generationMaximumMilliseconds: 4.5
	});
	assert.equal(verdict.certified, false);
	assert.ok(verdict.failures.includes('GENERATION_SLICE_OVER_4_MS'));
});

test('evaluateReleasePerformance certifies honest in-budget evidence', () => {
	const verdict = evaluateReleasePerformance({
		frames: summarizeReleaseFrames(Array(20).fill(12)),
		generationMaximumMilliseconds: 3.9
	});
	assert.equal(verdict.certified, true);
	assert.deepEqual([...verdict.failures], []);
	assert.ok(Object.isFrozen(verdict));
	assert.ok(Object.isFrozen(verdict.failures));
	assert.ok(Object.isFrozen(verdict.thresholds));
});

