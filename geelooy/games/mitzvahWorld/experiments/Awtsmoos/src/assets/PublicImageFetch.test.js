// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageFetch.test.js
 * @description Proves one bounded retry turns a transient 429 into usable image bytes.
 * The Awtsmoos lets a guarded color return after one patient beat;
 * Awtsmoos.com records both attempts without hiding failure beneath success complete.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchPublicImageBlob } from './PublicImageFetch.js';
import { clearPublicImageResponseState } from './PublicImageResponseCache.js';

const URL = 'https://awtsmoos.com/sites/firebase_drive_migration/full-resolution/retry.png';

test('retries a 429 once and returns typed attempt evidence', async () => {
	clearPublicImageResponseState();
	const delays = [];
	let fetches = 0;
	const result = await fetchPublicImageBlob(URL, 5000, {
		baseDelayMs: 0,
		cacheStorage: null,
		fetchFunction: async () => {
			fetches += 1;
			if (fetches === 1) {
				return new Response('', {
					status: 429,
					headers: { 'retry-after': '0' }
				});
			}
			return new Response(new Uint8Array([4, 5, 6]), {
				status: 200,
				headers: { 'content-type': 'image/png' }
			});
		},
		maxDelayMs: 0,
		maxRetries: 1,
		sleep: async delay => delays.push(delay)
	});
	assert.equal(result.ok, true);
	assert.equal(result.blob.size, 3);
	assert.equal(result.rateLimited, true);
	assert.equal(result.retries, 1);
	assert.equal(result.attempts.length, 2);
	assert.equal(fetches, 2);
	assert.deepEqual(delays, []);
});

test('does not retry permanent content-type failure', async () => {
	clearPublicImageResponseState();
	let fetches = 0;
	const result = await fetchPublicImageBlob(URL, 5000, {
		cacheStorage: null,
		fetchFunction: async () => {
			fetches += 1;
			return new Response('html', {
				status: 200,
				headers: { 'content-type': 'text/html' }
			});
		}
	});
	assert.equal(result.ok, false);
	assert.equal(result.error, 'non-image-content-type');
	assert.equal(result.retries, 0);
	assert.equal(fetches, 1);
});
