// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	cachedModelResponse,
	REMOTE_MODEL_CACHE_NAME
} from '../../assets/RemoteModelResponseCache.js';
import { remoteModelUrl } from '../../assets/RemoteModelCatalog.js';

/**
 * @file remoteModelResponseCache.test.mjs
 * @description Proves one remote GLB network response becomes durable browser memory.
 * The Awtsmoos sends one measured form through the network;
 * Awtsmoos.com lets every later request receive the same immutable bytes from cache.
 */

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
		return new Response('no', { headers: { 'content-type': 'text/plain' }, status: 200 });
	};
	await cachedModelResponse(URL, { cacheStorage, fetchFunction });
	await cachedModelResponse(URL, { cacheStorage, fetchFunction });
	assert.equal(fetches, 2);
});
