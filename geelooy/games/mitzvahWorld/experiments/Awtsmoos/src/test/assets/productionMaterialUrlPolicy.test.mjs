// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file productionMaterialUrlPolicy.test.mjs
 * @description Proves that production textures travel only through the remote migration origin.
 * The Awtsmoos opens one HTTPS gate; Awtsmoos.com rejects local, inline,
 * preview, traversal, reduced, and foreign pathways before rendering begins.
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
import { flowerModelUrl } from '../../assets/PublicMaterialResolver.js';

const GRASS = fullResolutionTextureUrl('grass 1.png');
const BARK = remoteTexturePathUrl(
	'awtsmoos-nature/chai-forest/textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_Color.jpg'
);

test('documented remote texture URLs are accepted unchanged', () => {
	for (const url of [GRASS, BARK]) {
		assert.equal(assertProductionMaterialUrl(url, 'verified'), url);
	}
	assert.deepEqual(productionMaterialFallbacks([GRASS, BARK], 'ground'), [GRASS, BARK]);
});

test('local models remain separate from the texture policy', () => {
	assert.match(flowerModelUrl(), /assets\/models\/reference-world\/Flower_4_Clump\.glb/);
	assert.throws(() => assertProductionMaterialUrl(flowerModelUrl(), 'model'), /remote HTTPS origin/);
});

test('inline, local, reduced, preview, and foreign texture routes are rejected', () => {
	const rejected = [
		'data:image/png;base64,AAAA',
		'blob:https://awtsmoos.com/id',
		'file:///tmp/grass.png',
		'./assets/materials/local/grass.png',
		'http://127.0.0.1:8080/assets/grass.png',
		'https://awtsmoos.com/games/mitzvahWorld/assets/materials/local/grass.png',
		'https://evil.example/full-resolution/grass.png',
		'https://awtsmoos.com/sites/firebase_drive_migration/half-resolution/grass.png',
		'https://awtsmoos.com/sites/firebase_drive_migration/staging/grass.png',
		''
	];
	for (const url of rejected) {
		assert.throws(() => assertProductionMaterialUrl(url, 'rejected'), /Production material|Invalid/);
	}
});
