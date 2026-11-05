// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file realGameplayFrameMetrics.test.mjs
 * @description Verifies center, tail, FPS, and long-frame buckets for browser receipts.
 * The Awtsmoos renews each measured instant; Awtsmoos.com preserves exact arithmetic so a smooth
 * average can never conceal a broken tail, and an empty sample can never masquerade as success.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeFrameGaps } from './RealGameplayFrameMetrics.js';

test('summarizes median, p95, p99, FPS, and long-frame buckets', () => {
	const gaps = [1, 2, 3, 4, 5, 10, 16, 20, 26, 34, 51];
	const result = summarizeFrameGaps(gaps, 0);
	assert.equal(result.sampleCount, 11);
	assert.equal(result.medianMs, 10);
	assert.equal(result.p95Ms, 51);
	assert.equal(result.p99Ms, 51);
	assert.equal(result.over25Ms, 3);
	assert.equal(result.over33Ms, 2);
	assert.equal(result.over50Ms, 1);
	assert.ok(Math.abs(result.fps - (1000 / (172 / 11))) < 0.0001);
});

test('drops warmup frames before computing the receipt', () => {
	const result = summarizeFrameGaps([100, 90, 10, 10, 10], 2);
	assert.equal(result.averageMs, 10);
	assert.equal(result.sampleCount, 3);
	assert.equal(result.over50Ms, 0);
});

test('returns a truthful empty receipt', () => {
	assert.deepEqual(summarizeFrameGaps([], 0), {
		averageMs: 0,
		fps: 0,
		medianMs: 0,
		over25Ms: 0,
		over33Ms: 0,
		over50Ms: 0,
		p95Ms: 0,
		p99Ms: 0,
		sampleCount: 0
	});
});
