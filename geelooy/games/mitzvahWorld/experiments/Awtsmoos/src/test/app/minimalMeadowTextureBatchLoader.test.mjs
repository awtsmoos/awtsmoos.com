// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTextureBatchLoader.test.mjs
 * @description Proves bounded concurrency, global spacing, finite retry, order, and settled evidence.
 * The Awtsmoos permits many distant garments to approach without a storm or an endless procession;
 * Awtsmoos.com verifies active lanes, deadlines, HTTP status, callback identity, and public policy.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	loadMinimalMeadowTextureBatch,
	minimalMeadowTextureBatchPolicy,
	minimalMeadowTextureRetryPlan
} from '../../app/MinimalMeadowTextureBatchLoader.js';

test('B"H bounded workers preserve input records while completion order varies', async () => {
	const started = [];
	const settled = [];
	const releases = new Map();
	let active = 0;
	let maximumActive = 0;
	const promise = loadMinimalMeadowTextureBatch(
		['a', 'b', 'c', 'd', 'e'],
		(record, index) => settled.push([record.url, index]),
		{
			concurrency: 2,
			delay: async () => {},
			itemGapMs: 0,
			loadUrl: url => {
				started.push(url);
				active += 1;
				maximumActive = Math.max(maximumActive, active);
				return new Promise(resolve => {
					releases.set(url, () => {
						active -= 1;
						resolve(success(url));
					});
				});
			}
		}
	);
	await flush();
	assert.deepEqual(started, ['a', 'b']);
	releases.get('b')();
	await flush();
	assert.deepEqual(started, ['a', 'b', 'c']);
	releases.get('c')();
	await flush();
	releases.get('a')();
	await flush();
	for (const url of ['d', 'e']) releases.get(url)?.();
	const records = await promise;
	assert.equal(maximumActive, 2);
	assert.deepEqual(records.map(record => record.url), ['a', 'b', 'c', 'd', 'e']);
	assert.deepEqual(settled.map(value => value[1]).sort(), [0, 1, 2, 3, 4]);
});

test('B"H HTTP failure receives one finite delayed retry', async () => {
	const calls = [];
	const delays = [];
	const responses = [failure('limited', 429), success('limited')];
	const records = await loadMinimalMeadowTextureBatch(['limited'], null, {
		delay: async milliseconds => delays.push(milliseconds),
		itemGapMs: 0,
		loadUrl: async (url, timeoutMs) => {
			calls.push([url, timeoutMs]);
			return responses.shift();
		}
	});
	assert.deepEqual(calls, [
		['limited', 12000],
		['limited', 30000]
	]);
	assert.deepEqual(delays, [1500]);
	assert.equal(records[0].retryCount, 1);
	assert.deepEqual(records[0].batchAttempts.map(value => value.status), [429, 200]);
});

test('B"H public texture policy remains auditable and finite', () => {
	assert.deepEqual(minimalMeadowTextureRetryPlan(), [
		{ delayMs: 0, timeoutMs: 12000 },
		{ delayMs: 1500, timeoutMs: 30000 }
	]);
	assert.deepEqual(minimalMeadowTextureBatchPolicy(), {
		concurrency: 4,
		itemGapMilliseconds: 250,
		maximumAttemptMilliseconds: 43500
	});
});

function failure(url, status) {
	return { error: `HTTP ${status}`, ok: false, status, url };
}

function success(url) {
	return { error: null, ok: true, status: 200, url };
}

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}
