// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalWorldAssets.test.js
 * @description Proves canonical valley promotion resolves one real grass and one real dirt image from cache
 * before swapping the bootstrap ground, keeps the network fallback bounded to cache misses in order,
 * and refuses a bare promotion with actionable evidence when both essential maps stay unavailable.
 * The Awtsmoos clothes earth with two truthful garments before the larger palace takes the field;
 * Awtsmoos.com keeps the swap honest: cache-first, bounded, and never a hidden bare mountain.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	canonicalWorldAssetPolicy,
	firstCachedImage,
	loadCanonicalWorldAssets
} from './EretzCanonicalWorldAssets.js';

const validImage = Object.freeze({ height: 32, width: 32 });

test('canonical promotion resolves grass and dirt from cache with bounded miss-only fallback', async () => {
	const cacheCalls = [];
	const loadUrlCalls = [];
	const cachedImage = url => {
		cacheCalls.push(url);
		return url === 'house-hit' || url === 'grass-hit' || url === 'dirt-hit' ? validImage : null;
	};
	const result = await loadCanonicalWorldAssets({
		cachedImage,
		dirtUrls: ['dirt-miss', 'dirt-hit'],
		grassUrls: ['grass-miss', 'grass-hit'],
		houseLoader: async loader => ({
			wallImage: await loader(['house-miss', 'house-hit'])
		}),
		loadUrl: async url => {
			loadUrlCalls.push(url);
			return { ok: false, url };
		}
	});
	assert.equal(result.assets.wallImage, validImage);
	assert.equal(result.grassImage, validImage);
	assert.equal(result.dirtImage, validImage);
	assert.equal(result.assets.canonicalTerrainTextureEvidence.status, 'ready');
	assert.equal(result.assets.canonicalTerrainTextureEvidence.grass.fromCache, true);
	assert.equal(result.assets.canonicalTerrainTextureEvidence.dirt.fromCache, true);
	assert.equal(result.policy.mode, 'essential-terrain-before-promotion');
	assert.equal(result.policy.networkBlocking, 'post-control-terrain-only');
	assert.equal(result.assets.canonicalWorldMaterialMode, 'essential-terrain-ready-before-promotion');
	for (const url of ['grass-miss', 'grass-hit', 'dirt-miss', 'dirt-hit']) {
		assert.ok(cacheCalls.includes(url), 'cache never consulted for ' + url);
	}
	assert.deepEqual([...loadUrlCalls].sort(), ['dirt-miss', 'grass-miss']);
});

test('canonical promotion refuses a bare valley when terrain textures stay degraded', async () => {
	const failure = { ok: false, url: 'grass-miss' };
	await assert.rejects(
		() => loadCanonicalWorldAssets({
			cachedImage: () => null,
			dirtUrls: ['dirt-miss'],
			grassUrls: ['grass-miss'],
			houseLoader: async () => ({}),
			loadUrl: async () => failure
		}),
		/canonical_terrain_textures_unavailable status=degraded/
	);
});

test('first cached image skips missing and invalid entries without network fallback', () => {
	const image = firstCachedImage(
		['missing', 'invalid', 'ready'],
		url => {
			if (url === 'invalid') return { height: 0, width: 0 };
			if (url === 'ready') return validImage;
			return null;
		}
	);
	assert.equal(image, validImage);
	assert.equal(firstCachedImage(['missing'], () => null), null);
	assert.equal(canonicalWorldAssetPolicy().mode, 'essential-terrain-before-promotion');
	assert.equal(canonicalWorldAssetPolicy().networkBlocking, 'post-control-terrain-only');
	assert.equal(canonicalWorldAssetPolicy({ status: 'ready' }).essentialTerrainStatus, 'ready');
});
