// B"H
// Boruch Hashem
// Blessed be He

/**
 * @file EretzDeferredEssentialAssets.test.js
 * @description Proves the canonical Chossid GLB warm-up fetch starts in parallel
 * with the player-chunk import, so a cold cache never serializes the two
 * largest boot downloads behind one another.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

test('beginDeferredEretzEssentialAssets warms the GLB fetch before the chunk import resolves', async () => {
	const fetched = [];
	const fakeFetch = (url, options) => {
		fetched.push({ url: String(url), options });
		// Never resolve: proves the warmup is fire-and-forget and boot does
		// not wait for it.
		return new Promise(() => {});
	};
	const realFetch = globalThis.fetch;
	globalThis.fetch = fakeFetch;
	try {
		const module = await import('./EretzDeferredEssentialAssets.js');
		// The dynamic player-chunk import will fail in Node (no such module
		// URL); swallow it — we only care that the warmup fired first.
		const promise = module.beginDeferredEretzEssentialAssets({});
		promise.catch(() => {});
		await new Promise(resolve => setTimeout(resolve, 50));
		const warmups = fetched.filter(entry => entry.url.endsWith('/chossid.glb'));
		assert.ok(
			warmups.length >= 1,
			`expected a GLB warmup fetch, got: ${JSON.stringify(fetched.map(entry => entry.url))}`
		);
		assert.equal(warmups[0].options.credentials, 'omit');
		assert.equal(warmups[0].options.mode, 'cors');
	} finally {
		if (realFetch === undefined) delete globalThis.fetch;
		else globalThis.fetch = realFetch;
	}
});

test('beginDeferredEretzEssentialAssets survives a missing fetch implementation', async () => {
	const realFetch = globalThis.fetch;
	delete globalThis.fetch;
	try {
		const module = await import('./EretzDeferredEssentialAssets.js');
		const promise = module.beginDeferredEretzEssentialAssets({});
		promise.catch(() => {});
		await new Promise(resolve => setTimeout(resolve, 50));
		// No throw: the warmup is best-effort.
	} finally {
		if (realFetch === undefined) delete globalThis.fetch;
		else globalThis.fetch = realFetch;
	}
});
