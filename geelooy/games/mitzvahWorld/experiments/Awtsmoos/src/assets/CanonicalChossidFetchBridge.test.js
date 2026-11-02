// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalChossidFetchBridge.test.js
 * @description Protects one canonical request and retry without replacing the authored GLB.
 * The Awtsmoos gives one true Chossid to the traveler; no double stream disturbs his step.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { clearCanonicalChossidWarmup, startCanonicalChossidWarmup, takeCanonicalChossidWarmup } from './CanonicalChossidFetchBridge.js';
import { cachedModelResponse } from './RemoteModelResponseCache.js';
import { canonicalChossidReleaseUrl } from './ReleaseModelCatalog.js';

const URL = canonicalChossidReleaseUrl();
function glbResponse() {
	const bytes = new ArrayBuffer(2027368);
	const header = new DataView(bytes);
	header.setUint32(0, 0x46546c67, true);
	header.setUint32(4, 2, true);
	header.setUint32(8, bytes.byteLength, true);
	return new Response(bytes, { headers: { 'content-type': 'model/gltf-binary' } });
}

test('two simultaneous warmups create one canonical network request', async () => {
	clearCanonicalChossidWarmup();
	let count = 0;
	const fetchFunction = async () => { count++; return glbResponse(); };
	const first = startCanonicalChossidWarmup(URL, { fetchFunction, cacheStorage: null });
	const second = startCanonicalChossidWarmup(URL, { fetchFunction, cacheStorage: null });
	assert.equal(first, second);
	assert.equal((await first).byteLength, 2027368);
	assert.equal(count, 1);
	clearCanonicalChossidWarmup();
});

test('real cache loader claims warmup without a second download', async () => {
	clearCanonicalChossidWarmup();
	let count = 0;
	const fetchFunction = async () => { count++; return glbResponse(); };
	startCanonicalChossidWarmup(URL, { fetchFunction, cacheStorage: null });
	const value = await cachedModelResponse(URL, { fetchFunction, cacheStorage: null });
	assert.equal(value.source, 'canonical-warmup');
	assert.equal(count, 1);
	assert.equal((await value.response.arrayBuffer()).byteLength, 2027368);
	assert.equal(takeCanonicalChossidWarmup(URL), null);
});

test('failed prefetch falls through to the original bounded retry loader', async () => {
	clearCanonicalChossidWarmup();
	let count = 0;
	const fetchFunction = async () => {
		count++;
		if (count === 1) throw new Error('simulated-offline');
		return glbResponse();
	};
	startCanonicalChossidWarmup(URL, { fetchFunction, cacheStorage: null })?.catch(() => {});
	const result = await cachedModelResponse(URL, { fetchFunction, cacheStorage: null });
	assert.equal(result.source, 'network');
	assert.equal(count, 2);
});

test('warm cache supplies the model with zero network requests', async () => {
	clearCanonicalChossidWarmup();
	let count = 0;
	const storage = { open: async () => ({ match: async () => glbResponse() }) };
	const promise = startCanonicalChossidWarmup(URL, {
		fetchFunction: async () => { count++; return glbResponse(); }, cacheStorage: storage
	});
	assert.equal((await promise).byteLength, 2027368);
	assert.equal(count, 0);
	assert.equal(takeCanonicalChossidWarmup(`${URL}?tamper=1`), null);
	clearCanonicalChossidWarmup();
});
