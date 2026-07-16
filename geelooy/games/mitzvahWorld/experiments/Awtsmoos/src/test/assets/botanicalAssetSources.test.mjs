// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file botanicalAssetSources.test.mjs
 * @description Proves flower models resolve to the exact published Firebase
 * sources without selecting the byte-identical, falsely named half tier.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { BOTANICAL_ASSET_SOURCES } from '../../assets/BotanicalAssetSources.js';

const ORIGIN = 'https://awtsmoos-docs-base.web.app';

test('flower sources use the exact published lowercase model URLs', () => {
	assert.deepEqual(BOTANICAL_ASSET_SOURCES.flowerModels, {
		blue: `${ORIGIN}/awtsmoos-nature/chai-forest/models/flower_blue.glb`,
		white: `${ORIGIN}/awtsmoos-nature/chai-forest/models/flower_white.glb`,
		yellow: `${ORIGIN}/awtsmoos-nature/chai-forest/models/flower_yellow.glb`
	});
	assert.equal(Object.isFrozen(BOTANICAL_ASSET_SOURCES), true);
	assert.equal(Object.isFrozen(BOTANICAL_ASSET_SOURCES.flowerModels), true);
});

test('botanical model policy never selects the fake half-model tier', () => {
	const urls = Object.values(BOTANICAL_ASSET_SOURCES.flowerModels);
	assert.equal(urls.length, 3);
	for (const url of urls) {
		assert.match(url, /\/awtsmoos-nature\/chai-forest\/models\/flower_[a-z]+\.glb$/);
		assert.doesNotMatch(url, /\/chai-forest-half\/models\//);
		assert.doesNotMatch(url, /\/Flowers_[A-Z]/);
	}
});
