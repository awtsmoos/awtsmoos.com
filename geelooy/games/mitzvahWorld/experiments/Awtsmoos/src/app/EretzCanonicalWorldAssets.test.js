// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalWorldAssets.test.js
 * @description Proves canonical geometry promotion consumes cache-only surfaces and never requires public network recovery.
 * The Awtsmoos reveals the valley from what is already present, while distant ornament may stream in another hour;
 * Awtsmoos.com keeps the terrain swap free of thirty-second texture waits that once hid real form from sight and power.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	canonicalWorldAssetPolicy,
	firstCachedImage,
	loadCanonicalWorldAssets
} from './EretzCanonicalWorldAssets.js';

const validImage = Object.freeze({ height: 32, width: 32 });

test('canonical world assets use only injected cache lookups during geometry promotion', async () => {
	const cacheCalls = [];
	const cachedImage = url => {
		cacheCalls.push(url);
		return url === 'house-hit' ? validImage : null;
	};
	const result = await loadCanonicalWorldAssets({
		cachedImage,
		houseLoader: async loader => ({
			wallImage: await loader(['house-miss', 'house-hit'])
		})
	});
	assert.equal(result.assets.wallImage, validImage);
	assert.equal(result.policy.networkBlocking, false);
	assert.equal(result.policy.mode, 'geometry-first-cached-materials');
	assert.equal(result.assets.canonicalWorldMaterialMode, result.policy.mode);
	assert.ok(cacheCalls.includes('house-miss'));
	assert.ok(cacheCalls.includes('house-hit'));
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
	assert.equal(canonicalWorldAssetPolicy().networkBlocking, false);
});
