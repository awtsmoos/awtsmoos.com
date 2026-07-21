// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file botanicalAssetSources.test.mjs
 * @description Proves dead flower aliases resolve to one existing local clump model.
 * The Awtsmoos preserves blue, white, and yellow semantic names while Awtsmoos.com
 * refuses a vanished network model tier and binds every alias to hydratable local geometry.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BOTANICAL_ASSET_SOURCES } from '../../assets/BotanicalAssetSources.js';
import { assertLocalFlowerUrl } from './LocalMaterialTestSupport.mjs';

const EXPECTED_SOURCES = Object.freeze({
	blue: '/awtsmoos-nature/chai-forest/models/flower_blue.glb',
	white: '/awtsmoos-nature/chai-forest/models/flower_white.glb',
	yellow: '/awtsmoos-nature/chai-forest/models/flower_yellow.glb'
});

test('flower aliases preserve color identity while sharing one local model', () => {
	for (const [color, sourcePath] of Object.entries(EXPECTED_SOURCES)) {
		assertLocalFlowerUrl(
			assert,
			BOTANICAL_ASSET_SOURCES.flowerModels[color],
			sourcePath
		);
	}
	assert.equal(Object.isFrozen(BOTANICAL_ASSET_SOURCES), true);
	assert.equal(Object.isFrozen(BOTANICAL_ASSET_SOURCES.flowerModels), true);
});

test('botanical model policy never selects remote or fake half-model tiers', () => {
	const urls = Object.values(BOTANICAL_ASSET_SOURCES.flowerModels);
	assert.equal(urls.length, 3);
	assert.equal(new Set(urls.map(url => new URL(url).pathname)).size, 1);
	for (const url of urls) {
		assert.doesNotMatch(url, /awtsmoos-docs-base|chai-forest-half/);
		assert.match(url, /Flower_4_Clump\.glb/);
	}
});
