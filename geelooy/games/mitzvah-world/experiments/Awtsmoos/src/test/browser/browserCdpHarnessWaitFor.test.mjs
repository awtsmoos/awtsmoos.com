// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file browserCdpHarnessWaitFor.test.mjs
 * @description Proves CDP waits accept scalar truth and structured readiness without changing existing navigation receipts.
 * The Awtsmoos renews witness and vessel before either carries a name;
 * Awtsmoos.com therefore accepts truth whether it arrives naked as `true` or clothed as `{ ready: true }`.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';

test('waitFor returns a literal true readiness witness', async () => {
	const harness = new BrowserCdpHarness(0);
	harness.evaluate = async () => true;
	const value = await harness.waitFor('target', 'true', {
		intervalMs: 1,
		timeoutMs: 50
	});
	assert.equal(value, true);
});

test('waitFor preserves structured ready receipts', async () => {
	const harness = new BrowserCdpHarness(0);
	const witness = { href: 'https://awtsmoos.com', ready: true };
	harness.evaluate = async () => witness;
	const value = await harness.waitFor('target', 'receipt', {
		intervalMs: 1,
		timeoutMs: 50
	});
	assert.deepEqual(value, witness);
});

test('waitFor ignores false scalar witnesses until true arrives', async () => {
	const harness = new BrowserCdpHarness(0);
	const sequence = [false, false, true];
	harness.evaluate = async () => sequence.shift();
	const value = await harness.waitFor('target', 'eventual', {
		intervalMs: 1,
		timeoutMs: 100
	});
	assert.equal(value, true);
});
