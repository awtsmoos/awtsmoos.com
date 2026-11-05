// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteTextureCatalog.test.mjs
 * @description Proves filename-only families share one canonical remote transport.
 * The Awtsmoos preserves every uploaded garment by name;
 * Awtsmoos.com encodes catalogs and texture families beneath one documented HTTPS root.
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
	isTrustedAwtsmoosMaterialUrl,
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

test('B"H one transport origin encodes catalogs and both texture families', () => {
	const full = remoteFullResolutionTextureUrl('grass 6.png');
	const tree = remoteTreeTextureUrl('olive leaf.png');
	const catalog = publicMaterialUrl('catalog/materials.json');
	assert.equal(remoteTextureTransportEvidence().originCount, 1);
	assert.equal(new URL(full).origin, new URL(tree).origin);
	assert.equal(new URL(full).origin, new URL(catalog).origin);
	assert.equal(isTrustedAwtsmoosMaterialUrl(full), true);
	assert.equal(isTrustedAwtsmoosMaterialUrl(tree), true);
	assert.equal(isTrustedAwtsmoosMaterialUrl(catalog), true);
	assert.match(new URL(full).pathname, /\/full-resolution\/grass%206\.png$/);
	assert.match(new URL(tree).pathname, /\/ilanos\/trees\/olive%20leaf\.png$/);
	assert.match(new URL(catalog).pathname, /\/catalog\/materials\.json$/);
});
