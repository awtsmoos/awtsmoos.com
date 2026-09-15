// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file productionMaterialUrlPolicy.test.mjs
 * @description Proves remote textures and content-addressed Drive models pass distinct production contracts.
 * The Awtsmoos gives each media family one truthful gate; Awtsmoos.com trusts exact immutable model identities without pretending models are textures.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	assertProductionMaterialUrl,
	productionMaterialFallbacks
} from '../../assets/ProductionMaterialUrlPolicy.js';
import {
	fullResolutionTextureUrl,
	remoteTexturePathUrl
} from '../../assets/RemoteTextureTransport.js';
import { isTrustedModelUrl } from '../../assets/RemoteModelCatalog.js';
import { flowerModelUrl } from '../../assets/PublicMaterialResolver.js';

const GRASS = fullResolutionTextureUrl('grass 1.png');
const BARK = remoteTexturePathUrl('awtsmoos-nature/chai-forest/textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_Color.jpg');

test('documented remote texture URLs are accepted unchanged', () => {
	for (const url of [GRASS, BARK]) {
		assert.equal(assertProductionMaterialUrl(url, 'verified'), url);
	}
	assert.deepEqual(productionMaterialFallbacks([GRASS, BARK], 'ground'), [GRASS, BARK]);
});

test('the flower model uses exact content-addressed Awtsmoos Drive truth', () => {
	const url = flowerModelUrl();
	assert.equal(isTrustedModelUrl(url), true);
	assert.match(
		url,
		/^https:\/\/awtsmoos\.com\/sites\/firebase_drive_migration\/assets\/mitzvah-world\/models\/reference-world\/[a-f0-9]{64}\/Flower_4_Clump\.glb$/
	);
	assert.equal(isTrustedModelUrl(url.replace(/[a-f0-9]{64}/, '0'.repeat(64))), false);
	assert.throws(
		() => assertProductionMaterialUrl(url, 'model'),
		/Production material|Invalid production material URL/
	);
});

test('inline, mutable, preview, and foreign texture routes are rejected', () => {
	const rejected = [
		'data:image/png;base64,AAAA',
		'blob:https://awtsmoos.com/id',
		'file:///tmp/grass.png',
		'./assets/materials/local/grass.png',
		'http://127.0.0.1:8080/assets/grass.png',
		'https://evil.example/full-resolution/grass.png',
		'https://awtsmoos.com/sites/firebase_drive_migration/half-resolution/grass.png',
		'https://awtsmoos.com/sites/firebase_drive_migration/staging/grass.png',
		''
	];
	for (const url of rejected) {
		assert.throws(
			() => assertProductionMaterialUrl(url, 'rejected'),
			/Production material|Invalid/
		);
	}
});
