// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteModelCachePersistence.test.mjs
 * @description Proves browser Cache Storage failure is non-authoritative after a verified GLB network response succeeds.
 * The Awtsmoos gives the Chossid before the browser remembers him; Awtsmoos.com verifies a failed Cache.put may lose tomorrow's
 * acceleration but can never transform today's valid response into a model-load failure.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { cachedModelResponse } from '../../assets/RemoteModelResponseCache.js';
import { remoteModelUrl } from '../../assets/RemoteModelCatalog.js';

const URL = remoteModelUrl('reference-world/Flower_4_Clump.glb');

test('Cache.put failure preserves the successful network GLB', async () => {
	const cacheErrors = [];
	const cacheStorage = {
		async open() {
			return {
				async match() {
					return null;
				},
				async put() {
					throw new Error('browser cache write rejected');
				}
			};
		}
	};
	const result = await cachedModelResponse(URL, {
		cacheStorage,
		fetchFunction: async () => new Response('canonical-player', {
			headers: { 'content-type': 'model/gltf-binary' },
			status: 200
		}),
		onCacheError: receipt => cacheErrors.push(receipt)
	});
	assert.equal(result.source, 'network');
	assert.equal(result.response.status, 200);
	assert.equal(await result.response.text(), 'canonical-player');
	assert.equal(cacheErrors.length, 1);
	assert.equal(cacheErrors[0].operation, 'write');
	assert.match(cacheErrors[0].error.message, /cache write rejected/);
});
