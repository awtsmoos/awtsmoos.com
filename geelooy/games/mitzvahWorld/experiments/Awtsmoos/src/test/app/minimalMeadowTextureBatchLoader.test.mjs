// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTextureBatchLoader.test.mjs
 * @description Proves serialized remote requests, 429 backoff, success recovery, and final evidence.
 * The Awtsmoos permits a distant vessel to breathe between requests; Awtsmoos.com verifies
 * exact delay, timeout, status, retry count, item spacing, settled order, and bounded failure.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	loadMinimalMeadowTextureBatch,
	minimalMeadowTextureRetryPlan
} from '../../app/MinimalMeadowTextureBatchLoader.js';

test('B"H HTTP 429 waits before retry and later URLs remain serialized', async () => {
	const calls = [];
	const delays = [];
	const settled = [];
	const responses = new Map([
		['first', [failure('first', 429), success('first')]],
		['second', [success('second')]]
	]);
	const records = await loadMinimalMeadowTextureBatch(
		['first', 'second'],
		(record, index) => settled.push([record.url, index]),
		{
			delay: async milliseconds => delays.push(milliseconds),
			loadUrl: async (url, timeoutMs) => {
				calls.push([url, timeoutMs]);
				return responses.get(url).shift();
			}
		}
	);
	assert.deepEqual(calls, [
		['first', 18000],
		['first', 32000],
		['second', 18000]
	]);
	assert.deepEqual(delays, [2500, 400]);
	assert.deepEqual(settled, [['first', 0], ['second', 1]]);
	assert.equal(records[0].retryCount, 1);
	assert.deepEqual(records[0].batchAttempts.map(value => value.status), [429, 200]);
	assert.equal(records[1].retryCount, 0);
});

test('B"H final failure preserves all three increasing attempts', async () => {
	const delays = [];
	const records = await loadMinimalMeadowTextureBatch(['limited'], null, {
		delay: async milliseconds => delays.push(milliseconds),
		itemGapMs: 0,
		loadUrl: async url => failure(url, 429)
	});
	assert.deepEqual(delays, [2500, 10000]);
	assert.equal(records[0].ok, false);
	assert.equal(records[0].retryCount, 2);
	assert.deepEqual(
		records[0].batchAttempts.map(value => value.timeoutMs),
		[18000, 32000, 45000]
	);
	assert.ok(records[0].batchAttempts.every(value => value.status === 429));
});

test('B"H public retry plan remains auditable and increasing', () => {
	assert.deepEqual(minimalMeadowTextureRetryPlan(), [
		{ delayMs: 0, timeoutMs: 18000 },
		{ delayMs: 2500, timeoutMs: 32000 },
		{ delayMs: 10000, timeoutMs: 45000 }
	]);
});

function failure(url, status) {
	return { error: `HTTP ${status}`, ok: false, status, url };
}

function success(url) {
	return { error: null, ok: true, status: 200, url };
}
