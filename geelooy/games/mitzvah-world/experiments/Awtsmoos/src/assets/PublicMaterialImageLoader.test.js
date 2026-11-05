// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialImageLoader.test.js
 * @description Proves fetched bytes outrank silent image events while circuit and absolute-deadline guarantees remain bounded.
 * The Awtsmoos is beyond network and decoder; Awtsmoos.com tests each finite doorway so one mute browser event
 * can never exile a real texture whose verified bytes already arrived from the production source.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { cachedImageResponse, clearPublicImageResponseState } from './PublicImageResponseCache.js';
import { loadPublicMaterialImage } from './PublicMaterialImageLoader.js';
import { successfulImageClass } from '../test/support/PublicMaterialImageLoaderTestDoubles.mjs';

const URL = 'https://awtsmoos.com/sites/firebase_drive_migration/full-resolution/circuit.png';

test('fetch/blob decode succeeds without waiting for silent direct Image events', async () => {
	clearPublicImageResponseState();
	class SilentImage { set src(value) { this.currentSrc = value; } }
	const result = await loadPublicMaterialImage(URL, 1000, {
		cacheStorage: null,
		createImageBitmapFunction: async () => ({ height: 32, width: 64 }),
		fetchFunction: async () => new Response(new Uint8Array([1, 2, 3]), {
			headers: { 'content-type': 'image/png' },
			status: 200
		}),
		ImageClass: SilentImage
	});
	assert.equal(result.ok, true);
	assert.equal(result.method, 'blob-image-bitmap');
	assert.equal(result.width, 64);
	assert.equal(result.height, 32);
	assert.equal(result.attempts[0].stage, 'fetched');
	assert.equal(result.attempts[1].method, 'blob-image-bitmap');
});

test('falls back to direct Image decode after a network-level fetch failure', async () => {
	clearPublicImageResponseState();
	const result = await loadPublicMaterialImage(URL, 1000, {
		cacheStorage: null,
		fetchFunction: async () => { throw new Error('offline-fetch'); },
		ImageClass: successfulImageClass()
	});
	assert.equal(result.ok, true);
	assert.equal(result.method, 'direct-image-url');
	assert.ok(result.attempts.some(attempt => attempt.method === 'direct-image-url'));
});

test('skips direct decode and network retry while a 429 circuit is open', async () => {
	clearPublicImageResponseState();
	let fetches = 0;
	const dependencies = {
		cacheStorage: null,
		fetchFunction: async () => {
			fetches += 1;
			return new Response('', { headers: { 'retry-after': '10' }, status: 429 });
		},
		ImageClass: successfulImageClass(),
		now: () => 1000
	};
	await cachedImageResponse(URL, dependencies);
	const result = await loadPublicMaterialImage(URL, 1000, dependencies);
	assert.equal(result.ok, false);
	assert.equal(result.rateLimited, true);
	assert.equal(result.retries, 0);
	assert.equal(result.attempts[0].error, 'rate-limit-circuit-open');
	assert.equal(result.attempts[1].method, 'rate-limit-circuit');
	assert.equal(fetches, 1);
});

test('settles a fully hanging pipeline at the absolute material deadline', async () => {
	clearPublicImageResponseState();
	class SilentImage { set src(value) { this.currentSrc = value; } }
	const startedAt = Date.now();
	const result = await loadPublicMaterialImage(URL, 20, {
		cacheStorage: null,
		fetchFunction: () => new Promise(() => {}),
		ImageClass: SilentImage
	});
	assert.equal(result.ok, false);
	assert.equal(result.error, 'material-deadline-exceeded');
	assert.equal(result.method, 'material-deadline');
	assert.equal(result.stage, 'deadline');
	assert.ok(Date.now() - startedAt < 250);
});
