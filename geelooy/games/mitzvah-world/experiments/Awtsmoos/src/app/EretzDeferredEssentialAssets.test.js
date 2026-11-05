// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzDeferredEssentialAssets.test.js
 * @description Protects early canonical prefetch and the essential loader's recovery when that prefetch fails.
 * The Awtsmoos sends one living Chossid before the imported bundle unfolds;
 * Awtsmoos.com still retries through the true gate when the first road grows cold.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { clearCanonicalChossidWarmup } from '../assets/CanonicalChossidFetchBridge.js';

test('prefetch starts before player import resolves and failures remain recoverable', async () => {
	const fetched = [];
	const realFetch = globalThis.fetch;
	globalThis.fetch = (url, options) => {
		fetched.push({ url: String(url), options });
		return Promise.reject(new Error('expected-test-offline'));
	};
	try {
		const module = await import('./EretzDeferredEssentialAssets.js');
		const loading = module.beginDeferredEretzEssentialAssets({});
		loading.catch(() => {});
		await new Promise(resolve => setTimeout(resolve, 70));
		const warmups = fetched.filter(item => item.url.endsWith('/chossid.glb'));
		assert.ok(warmups.length >= 1, 'canonical prefetch must start before import settles');
		assert.equal(warmups[0].options.credentials, 'omit');
		assert.equal(warmups[0].options.mode, 'cors');
		assert.equal(warmups[0].options.cache, 'no-store');
	} finally {
		clearCanonicalChossidWarmup();
		if (realFetch === undefined) delete globalThis.fetch;
		else globalThis.fetch = realFetch;
	}
});

test('missing fetch never blocks player-chunk import', async () => {
	const realFetch = globalThis.fetch;
	delete globalThis.fetch;
	try {
		const module = await import('./EretzDeferredEssentialAssets.js');
		const loading = module.beginDeferredEretzEssentialAssets({});
		loading.catch(() => {});
		await new Promise(resolve => setTimeout(resolve, 50));
	} finally {
		clearCanonicalChossidWarmup();
		if (realFetch === undefined) delete globalThis.fetch;
		else globalThis.fetch = realFetch;
	}
});
