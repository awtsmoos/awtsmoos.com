// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sidecarScannerBudget.test.js
 * @description
 * The legacy migration scanner obeys its wall-clock covenant even when a query
 * has not found a hit yet. No-match work may return truncated truth, but it may
 * not monopolize the event loop until an arbitrary later match appears.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { performance } = require('node:perf_hooks');
const { shouldStop } = require('../sidecarScanner.js');

function state({ scanned, elapsedMs, top = [] }) {
	return {
		scanned,
		startedAt: performance.now() - elapsedMs,
		top,
		limits: { maxRows: 4000, minRows: 512, maxMs: 100 }
	};
}

test('hard time budget applies after minimum testimony even with no hit', () => {
	assert.equal(shouldStop(state({ scanned: 511, elapsedMs: 1000 })), false);
	assert.equal(shouldStop(state({ scanned: 512, elapsedMs: 50 })), false);
	assert.equal(shouldStop(state({ scanned: 512, elapsedMs: 150 })), true);
});

test('row ceiling remains absolute regardless of elapsed time or hits', () => {
	assert.equal(shouldStop(state({ scanned: 4000, elapsedMs: 0 })), true);
});
