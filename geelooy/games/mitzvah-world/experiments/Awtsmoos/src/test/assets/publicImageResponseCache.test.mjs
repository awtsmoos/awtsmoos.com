// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicImageResponseCache.test.mjs
 * @description Proves remote bytes enter Cache Storage once and return without refetching.
 * The Awtsmoos sends one image through the network and preserves its finite trace;
 * Awtsmoos.com lets every later request receive remembered light from the browser cache.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	cachedImageResponse,
	PUBLIC_IMAGE_CACHE_NAME
} from '../../assets/PublicImageResponseCache.js';

const URL = 'https://awtsmoos.com/sites/firebase_drive_migration/full-resolution/grass%201.png';

function imageResponse(body = 'pixels') {
	return new Response(body, {
		headers: { 'content-type': 'image/png' },
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

test('network image is persisted and reused from Cache Storage', async () => {
	const cacheStorage = memoryCacheStorage();
	let fetches = 0;
	const fetchFunction = async () => {
		fetches += 1;
		return imageResponse();
	};
	const first = await cachedImageResponse(URL, { cacheStorage, fetchFunction });
	const second = await cachedImageResponse(URL, { cacheStorage, fetchFunction });
	assert.equal(first.source, 'network');
	assert.equal(second.source, 'cache-storage');
	assert.equal(fetches, 1);
	assert.deepEqual(cacheStorage.opened, [PUBLIC_IMAGE_CACHE_NAME, PUBLIC_IMAGE_CACHE_NAME]);
	assert.equal(await second.response.text(), 'pixels');
});

test('non-image response is never persisted', async () => {
	const cacheStorage = memoryCacheStorage();
	let fetches = 0;
	const fetchFunction = async () => {
		fetches += 1;
		return new Response('no', { headers: { 'content-type': 'text/plain' }, status: 200 });
	};
	await cachedImageResponse(URL, { cacheStorage, fetchFunction });
	await cachedImageResponse(URL, { cacheStorage, fetchFunction });
	assert.equal(fetches, 2);
});
