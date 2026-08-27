// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file botanicalAssetSources.test.mjs
 * @description Proves semantic flower identities share one immutable same-origin repository model.
 * The Awtsmoos preserves blue, white, and yellow meaning through one finite form;
 * Awtsmoos.com serves verified content-addressed geometry without mutable third-party aliases.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BOTANICAL_ASSET_SOURCES } from '../../assets/BotanicalAssetSources.js';
import {
	isTrustedRemoteModelUrl,
	remoteModelUrl
} from '../../assets/RemoteModelCatalog.js';

const FLOWER_MODEL_ID = 'reference-world/Flower_4_Clump.glb';
const EXPECTED_IDENTITIES = Object.freeze({
	blue: 'botanical:flower-blue',
	white: 'botanical:flower-white',
	yellow: 'botanical:flower-yellow'
});

test('flower aliases preserve semantic identities while sharing one immutable model', () => {
	const expectedUrl = remoteModelUrl(FLOWER_MODEL_ID);
	const urls = [];
	for (const [color, identity] of Object.entries(EXPECTED_IDENTITIES)) {
		assert.equal(BOTANICAL_ASSET_SOURCES.flowerSourcePaths[color], identity);
		const url = BOTANICAL_ASSET_SOURCES.flowerModels[color];
		assert.equal(url, expectedUrl);
		assert.equal(isTrustedRemoteModelUrl(url), true);
		assert.match(url, /^https:\/\/awtsmoos\.com\/geelooy\/games\/mitzvahWorld\/assets\/models\//);
		assert.match(url, /\/[a-f0-9]{64}\//);
		assert.match(url, /\.glb$/);
		urls.push(url);
	}
	assert.equal(new Set(urls).size, 1);
});

test('botanical source policy never returns query-driven or third-party aliases', () => {
	const url = remoteModelUrl(FLOWER_MODEL_ID);
	assert.doesNotMatch(url, /[?#]/);
	assert.doesNotMatch(url, /drive\.google|github|raw\.github/);
	assert.equal(isTrustedRemoteModelUrl(`${url}?mutable=1`), false);
});
