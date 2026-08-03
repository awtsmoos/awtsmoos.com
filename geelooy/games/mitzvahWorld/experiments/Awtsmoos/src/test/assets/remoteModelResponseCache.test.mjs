// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteModelResponseCache.test.mjs
 * @description Proves verified GLBs persist and transient storage throttling honors bounded Retry-After recovery.
 * The Awtsmoos sends one measured form through changing network moments; Awtsmoos.com
 * remembers successful bytes while finite throttling delays rather than multiplies or corrupts requests.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	cachedModelResponse,
	REMOTE_MODEL_CACHE_NAME
} from '../../assets/RemoteModelResponseCache.js';
import { remoteModelUrl } from '../../assets/RemoteModelCatalog.js';

const URL = remoteModelUrl('reference-world/Flower_4_Clump.glb');

function glbResponse(body = 'glTF-model') {
	return new Response(body, {
		headers: { 'content-type': 'model/gltf-binary' },
		status: 200
	});
}

function memoryCacheStorage() {
	const records = new Map();
	return {
		opened: [],
		async open(name) {
			this.opened.push(name);
			return {
				async match(url) {
					return records.get(url)?.clone();
				},
				async put(url, response) {
					records.set(url, response.clone());
				}
			};
		}
	};
}

test('network GLB is persisted and reused from Cache Storage', async () => {
	const cacheStorage = memoryCacheStorage();
	let fetches = 0;
	const fetchFunction = async () => {
		fetches += 1;
		return glbResponse();
	};
	const first = await cachedModelResponse(URL, { cacheStorage, fetchFunction });
	const second = await cachedModelResponse(URL, { cacheStorage, fetchFunction });
	assert.equal(first.source, 'network');
	assert.equal(second.source, 'cache-storage');
	assert.equal(fetches, 1);
	assert.deepEqual(cacheStorage.opened, [REMOTE_MODEL_CACHE_NAME, REMOTE_MODEL_CACHE_NAME]);
	assert.equal(await second.response.text(), 'glTF-model');
});

test('non-GLB response is never persisted', async () => {
	const cacheStorage = memoryCacheStorage();
	let fetches = 0;
	const fetchFunction = async () => {
		fetches += 1;
		return new Response('no', {
			headers: { 'content-type': 'text/plain' },
			status: 200
		});
	};
	await cachedModelResponse(URL, { cacheStorage, fetchFunction });
	await cachedModelResponse(URL, { cacheStorage, fetchFunction });
	assert.equal(fetches, 2);
});

test('429 Retry-After is honored once and successful GLB is cached', async () => {
	const cacheStorage = memoryCacheStorage();
	const waits = [];
	const retries = [];
	let fetches = 0;
	const fetchFunction = async () => {
		fetches += 1;
		if (fetches === 1) {
			return new Response('slow down', {
				headers: { 'retry-after': '60' },
				status: 429
			});
		}
		return glbResponse('canonical');
	};
	const result = await cachedModelResponse(URL, {
		cacheStorage,
		fetchFunction,
		onRetry: retry => retries.push(retry),
		waitFunction: async milliseconds => waits.push(milliseconds)
	});
	assert.equal(result.response.status, 200);
	assert.equal(fetches, 2);
	assert.deepEqual(waits, [60000]);
	assert.deepEqual(retries.map(retry => retry.status), [429]);
	const cached = await cachedModelResponse(URL, {
		cacheStorage,
		fetchFunction: async () => assert.fail('cache should avoid network')
	});
	assert.equal(cached.source, 'cache-storage');
	assert.equal(await cached.response.text(), 'canonical');
});

test('permanent 404 is returned without retry', async () => {
	const waits = [];
	const response = await cachedModelResponse(URL, {
		cacheStorage: null,
		fetchFunction: async () => new Response('missing', { status: 404 }),
		waitFunction: async milliseconds => waits.push(milliseconds)
	});
	assert.equal(response.response.status, 404);
	assert.deepEqual(waits, []);
});
