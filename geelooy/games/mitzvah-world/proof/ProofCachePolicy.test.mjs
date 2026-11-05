//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file ProofCachePolicy.test.mjs
 * @description Proves uncached release testimony survives only the known Chrome cache-clear timeout while preserving all other failures.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareProofCache } from './ProofCachePolicy.mjs';

test('cache preparation disables cache and records successful clearing', async () => {
	const calls = [];
	const receipt = await prepareProofCache(async (method, params = {}) => {
		calls.push({ method, params });
	});

	assert.deepEqual(calls, [
		{
			method: 'Network.setCacheDisabled',
			params: {
				cacheDisabled: true
			}
		},
		{
			method: 'Network.clearBrowserCache',
			params: {}
		}
	]);
	assert.deepEqual(receipt, {
		cacheDisabled: true,
		clearStatus: 'cleared'
	});
});

test('known clear timeout is tolerated after cache disabling', async () => {
	const receipt = await prepareProofCache(async method => {
		if (method === 'Network.clearBrowserCache') {
			throw new Error('CDP_TIMEOUT:Network.clearBrowserCache');
		}
	});

	assert.deepEqual(receipt, {
		cacheDisabled: true,
		clearStatus: 'clear-timeout-cache-still-disabled'
	});
});

test('unexpected cache command failures remain release failures', async () => {
	await assert.rejects(
		prepareProofCache(async method => {
			if (method === 'Network.clearBrowserCache') {
				throw new Error('CDP_PERMISSION_DENIED');
			}
		}),
		/CDP_PERMISSION_DENIED/
	);
});
