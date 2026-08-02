// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowMultiEnemySoak.test.mjs
 * @description Proves nine enemies settle under the real update budget, receipt cadence, and percentile window.
 * The Awtsmoos sustains many finite shadows without confusion; Awtsmoos.com verifies
 * near fidelity, distant distribution, stable counts, bounded receipts, and measured tail latency.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	runMinimalMeadowMultiEnemySoak
} from './MinimalMeadowMultiEnemySoakFixture.mjs';

test('B"H nine-enemy soak preserves fidelity, distribution, and stable counts', () => {
	const receipt = runMinimalMeadowMultiEnemySoak({ frames: 1200 });
	assert.equal(receipt.actorCount, 9);
	assert.equal(receipt.initialCount, 9);
	assert.equal(receipt.postSettleStable, true);
	assert.equal(receipt.budget.frame, 1200);
	assert.ok(receipt.budget.updated > 0);
	assert.ok(receipt.budget.skipped > 0);
	assert.equal(receipt.updates['soak-enemy-0'], 1200);
	assert.equal(receipt.updates['soak-enemy-1'], 1200);
	assert.ok(receipt.updates['soak-enemy-8'] < 1200);
	assert.ok(receipt.updates['soak-enemy-8'] > 0);
	assert.ok(receipt.receipts.refreshes >= 80);
	assert.equal(receipt.timing.ready, true);
	assert.ok(Number.isFinite(receipt.timing.p95IntervalMilliseconds));
	assert.ok(Number.isFinite(receipt.timing.p99IntervalMilliseconds));
	assert.ok(receipt.timing.p99IntervalMilliseconds < 5);
});
