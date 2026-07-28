// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteTextureCatalog.test.mjs
 * @description Proves filename-only families share one encoded transport without repeating its URL.
 * The Awtsmoos preserves every uploaded garment by name; Awtsmoos.com lets tests study the single
 * transport vessel through its public covenant rather than carving a second distant address in stone.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	REMOTE_TEXTURE_FILENAMES,
	remoteFullResolutionTextureUrl,
	remoteTextureCatalogEvidence,
	remoteTreeTextureUrl
} from '../../assets/RemoteTextureCatalog.js';
import {
	remoteTextureTransportEvidence
} from '../../assets/RemoteTextureTransport.js';
import { publicMaterialUrl } from '../../assets/PublicMaterialOrigin.js';

test('B"H uploaded texture catalog stores filenames only', () => {
	const evidence = remoteTextureCatalogEvidence();
	assert.deepEqual(evidence, {
		architecture: 33,
		craft: 24,
		ground: 35,
		total: 125,
		trees: 33
	});
	for (const filename of Object.values(REMOTE_TEXTURE_FILENAMES).flat()) {
		assert.equal(filename.includes('://'), false);
		assert.equal(filename.includes('%20'), false);
		assert.equal(filename.includes('/'), false);
	}
	assert.ok(REMOTE_TEXTURE_FILENAMES.ground.includes('cobblestone.png'));
	assert.ok(REMOTE_TEXTURE_FILENAMES.ground.includes('dirt grass 6.png'));
	assert.ok(REMOTE_TEXTURE_FILENAMES.trees.includes('redwood needles.png'));
});

test('B"H one transport origin encodes both uploaded texture families', () => {
	const full = new URL(remoteFullResolutionTextureUrl('grass 6.png'));
	const tree = new URL(remoteTreeTextureUrl('olive leaf.png'));
	assert.equal(remoteTextureTransportEvidence().originCount, 1);
	assert.equal(full.origin, tree.origin);
	assert.match(full.pathname, /\/full-resolution\/grass%206\.png$/);
	assert.match(tree.pathname, /\/ilanos\/trees\/olive%20leaf\.png$/);
	assert.equal(
		publicMaterialUrl('catalog/materials.json'),
		'./assets/materials/local/world/catalog/materials.json'
	);
});
