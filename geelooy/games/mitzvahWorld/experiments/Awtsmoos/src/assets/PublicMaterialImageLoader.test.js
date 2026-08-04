// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialImageLoader.test.js
 * @description Proves rate-limit suppression and one absolute material deadline across hanging stages.
 * The Awtsmoos keeps procedural color alive while guarded origins rest;
 * Awtsmoos.com records every closed doorway and lets no unresolved browser promise freeze a district.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { cachedImageResponse } from './PublicImageResponseCache.js';
import { clearPublicImageResponseState } from './PublicImageResponseCache.js';
import { loadPublicMaterialImage } from './PublicMaterialImageLoader.js';
import { successfulImageClass } from '../test/support/PublicMaterialImageLoaderTestDoubles.mjs';

const URL = 'https://awtsmoos.com/sites/firebase_drive_migration/full-resolution/circuit.png';

test('skips direct decode and network retry while a 429 circuit is open', async () => {
	clearPublicImageResponseState();
	let fetches = 0;
	const dependencies = {
		cacheStorage: null,
		fetchFunction: async () => {
			fetches += 1;
			return new Response('', {
				status: 429,
				headers: { 'retry-after': '10' }
			});
		},
		ImageClass: successfulImageClass(),
		now: () => 1000
	};
	await cachedImageResponse(URL, dependencies);
	const result = await loadPublicMaterialImage(URL, 1000, dependencies);
	assert.equal(result.ok, false);
	assert.equal(result.rateLimited, true);
	assert.equal(result.retries, 0);
	assert.equal(result.attempts[0].method, 'direct-image-url-skipped-circuit');
	assert.equal(result.attempts[1].method, 'rate-limit-circuit');
	assert.equal(fetches, 1);
});

test('settles a hanging image pipeline at the absolute material deadline', async () => {
	clearPublicImageResponseState();
	class SilentImage {
		set src(value) {
			this.currentSrc = value;
		}
	}
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
