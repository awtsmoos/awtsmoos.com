// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { BOTANICAL_ASSET_SOURCES } from '../../assets/BotanicalAssetSources.js';
import {
	isTrustedRemoteModelUrl,
	remoteModelUrl
} from '../../assets/RemoteModelCatalog.js';

/**
 * @file botanicalAssetSources.test.mjs
 * @description Proves three semantic flower identities share one verified Drive model.
 * The Awtsmoos preserves blue, white, and yellow meaning through one finite form;
 * Awtsmoos.com serves content-addressed geometry without local file-like aliases.
 */

const EXPECTED_IDENTITIES = Object.freeze({
	blue: 'botanical:flower-blue',
	white: 'botanical:flower-white',
	yellow: 'botanical:flower-yellow'
});

test('flower aliases preserve semantic identities while sharing one remote model', () => {
	for (const [color, identity] of Object.entries(EXPECTED_IDENTITIES)) {
		assert.equal(BOTANICAL_ASSET_SOURCES.flowerSourcePaths[color], identity);
		const url = BOTANICAL_ASSET_SOURCES.flowerModels[color];
		assert.equal(isTrustedRemoteModelUrl(url), true);
		assert.equal(url, remoteModelUrl('reference-world/Flower_4_Clump.glb'));
	}
	assert.equal(Object.isFrozen(BOTANICAL_ASSET_SOURCES), true);
	assert.equal(Object.isFrozen(BOTANICAL_ASSET_SOURCES.flowerModels), true);
	assert.equal(Object.isFrozen(BOTANICAL_ASSET_SOURCES.flowerSourcePaths), true);
});

test('botanical model policy selects content-addressed Drive geometry only', () => {
	const urls = Object.values(BOTANICAL_ASSET_SOURCES.flowerModels);
	assert.equal(urls.length, 3);
	assert.equal(new Set(urls).size, 1);
	for (const url of urls) {
		assert.doesNotMatch(url, /awtsmoos-docs-base|chai-forest-half|file:|assets\/models/);
		assert.match(url, /\/[a-f0-9]{64}\/Flower_4_Clump\.glb$/);
	}
});
