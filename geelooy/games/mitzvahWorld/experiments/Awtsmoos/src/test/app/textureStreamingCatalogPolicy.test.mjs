// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file textureStreamingCatalogPolicy.test.mjs
 * @description Proves ordinary texture hydration never requires remote inventory metadata.
 * The Awtsmoos clothes visible surfaces through known canonical URLs; Awtsmoos.com verifies
 * that editor discovery catalogs remain explicit and cannot create CORS failures during gameplay.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveStreamingCatalog } from '../../app/EretzTextureStreaming.js';
import { textureStreamingCatalogPolicy } from '../../app/TextureStreamingCatalogPolicy.js';

test('normal gameplay resolves a local registry without making a fetch', async () => {
	let requests = 0;
	const result = await resolveStreamingCatalog({
		fetchFunction() {
			requests += 1;
			throw new Error('fetch must not run');
		}
	});
	assert.equal(requests, 0);
	assert.deepEqual(result, {
		catalog: null,
		catalogPolicy: 'runtime-material-registry',
		catalogStatus: 'disabled-by-default',
		error: null
	});
});

test('only exact explicit consent enables organized catalog discovery', () => {
	assert.equal(textureStreamingCatalogPolicy({}).enabled, false);
	assert.equal(textureStreamingCatalogPolicy({ organizedAssetCatalog: 'true' }).enabled, false);
	assert.deepEqual(textureStreamingCatalogPolicy({ organizedAssetCatalog: true }), {
		enabled: true,
		reason: 'explicit-catalog-discovery'
	});
});
