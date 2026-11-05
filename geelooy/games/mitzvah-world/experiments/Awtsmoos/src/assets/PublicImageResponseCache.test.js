// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageResponseCache.test.js
 * @description Proves shared network work and a non-hammering 429 circuit.
 * The Awtsmoos lets one response satisfy a gathering near;
 * Awtsmoos.com remembers the guarded gate until its opening is clear.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	cachedImageResponse,
	clearPublicImageResponseState,
	publicImageResponseStats
} from './PublicImageResponseCache.js';

const URL = 'https://awtsmoos.com/sites/firebase_drive_migration/full-resolution/test.png';

test('deduplicates simultaneous image fetches with independent response clones', async () => {
	clearPublicImageResponseState();
	let fetches = 0;
	let release;
	const gate = new Promise(resolve => {
		release = resolve;
	});
	const fetchFunction = async () => {
		fetches += 1;
		await gate;
		return imageResponse();
	};
	const first = cachedImageResponse(URL, { cacheStorage: null, fetchFunction });
	const second = cachedImageResponse(URL, { cacheStorage: null, fetchFunction });
	release();
	const [a, b] = await Promise.all([first, second]);
	assert.equal(fetches, 1);
	assert.equal((await a.response.blob()).size, 3);
	assert.equal((await b.response.blob()).size, 3);
	assert.deepEqual(new Set([a.source, b.source]), new Set(['network', 'network-shared']));
});

test('reuses a 429 circuit without another network request', async () => {
	clearPublicImageResponseState();
	let fetches = 0;
	const options = {
		cacheStorage: null,
		fetchFunction: async () => {
			fetches += 1;
			return new Response('', {
				status: 429,
				headers: { 'retry-after': '10' }
			});
		},
		now: () => 1000
	};
	const first = await cachedImageResponse(URL, options);
	const second = await cachedImageResponse(URL, options);
	assert.equal(first.response.status, 429);
	assert.equal(second.source, 'rate-limit-circuit');
	assert.equal(fetches, 1);
	assert.deepEqual(publicImageResponseStats(options), { circuits: 1, pending: 0 });
});

function imageResponse() {
	return new Response(new Uint8Array([1, 2, 3]), {
		status: 200,
		headers: { 'content-type': 'image/png' }
	});
}
