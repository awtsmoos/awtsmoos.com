// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldReleaseProbeMetrics.test.js
 * @description Proves Chapter 3 release thresholds while retaining legacy >50ms diagnostics.
 * The Awtsmoos counts every measured interval without flattery or disguise;
 * Awtsmoos.com lets one percent fail exactly where the survival covenant draws its line before our eyes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	evaluateReleasePerformance,
	summarizeReleaseFrames
} from './MitzvahWorldReleaseProbeMetrics.js';

test('frame summary reports p50, p95, worst, and both long-frame counters', () => {
	const summary = summarizeReleaseFrames([12, 14, 15, 34, 55]);
	assert.equal(summary.count, 5);
	assert.equal(summary.p50Milliseconds, 15);
	assert.equal(summary.p95Milliseconds, 55);
	assert.equal(summary.worstMilliseconds, 55);
	assert.equal(summary.framesOver33_3Milliseconds, 2);
	assert.equal(summary.framesOver50Milliseconds, 1);
	assert.equal(summary.longFrameRate, 0.4);
});

test('empty and non-finite samples stay unsupported rather than becoming zeros', () => {
	const summary = summarizeReleaseFrames([NaN, Infinity, null, undefined]);
	assert.equal(summary.count, 0);
	assert.equal(summary.p95Milliseconds, null);
	assert.equal(summary.longFrameRate, null);
	const verdict = evaluateReleasePerformance({ frames: summary, generationMaximumMilliseconds: 2 });
	assert.deepEqual([...verdict.failures], ['FRAME_SAMPLES_MISSING']);
});

test('one long frame in two hundred remains below one percent', () => {
	const frames = summarizeReleaseFrames([...Array(199).fill(12), 40]);
	const verdict = evaluateReleasePerformance({ frames, generationMaximumMilliseconds: 3 });
	assert.equal(frames.longFrameRate, 0.005);
	assert.equal(verdict.certified, true);
});

test('exactly one percent long frames fails the strict boundary', () => {
	const frames = summarizeReleaseFrames([...Array(99).fill(12), 40]);
	const verdict = evaluateReleasePerformance({ frames, generationMaximumMilliseconds: 3 });
	assert.equal(frames.longFrameRate, 0.01);
	assert.equal(verdict.certified, false);
	assert.ok(verdict.failures.includes('LONG_FRAME_RATE_AT_OR_ABOVE_1_PERCENT'));
});

test('p95 over 16.7 milliseconds fails even when long-frame rate is zero', () => {
	const frames = summarizeReleaseFrames([...Array(189).fill(16), ...Array(11).fill(17)]);
	const verdict = evaluateReleasePerformance({ frames, generationMaximumMilliseconds: 3 });
	assert.equal(frames.p95Milliseconds, 17);
	assert.equal(frames.longFrameRate, 0);
	assert.ok(verdict.failures.includes('FRAME_P95_OVER_16_7_MS'));
});

test('repeated frames over fifty preserve the legacy diagnostic code', () => {
	const frames = summarizeReleaseFrames([...Array(198).fill(12), 55, 60]);
	const verdict = evaluateReleasePerformance({ frames, generationMaximumMilliseconds: 3 });
	assert.ok(verdict.failures.includes('REPEATED_FRAME_OVER_50_MS'));
	assert.ok(verdict.failures.includes('LONG_FRAME_RATE_AT_OR_ABOVE_1_PERCENT'));
});

test('generation evidence fails closed when absent or above four milliseconds', () => {
	const frames = summarizeReleaseFrames(Array(200).fill(12));
	const unsupported = evaluateReleasePerformance({ frames });
	assert.ok(unsupported.failures.includes('GENERATION_SLICE_UNSUPPORTED'));
	const overBudget = evaluateReleasePerformance({ frames, generationMaximumMilliseconds: 4.1 });
	assert.ok(overBudget.failures.includes('GENERATION_SLICE_OVER_4_MS'));
	const passing = evaluateReleasePerformance({ frames, generationMaximumMilliseconds: 4 });
	assert.equal(passing.certified, true);
});
