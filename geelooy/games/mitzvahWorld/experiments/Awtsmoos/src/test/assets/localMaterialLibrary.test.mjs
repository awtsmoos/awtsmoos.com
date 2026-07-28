// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file localMaterialLibrary.test.mjs
 * @description Proves every declared texture identity resolves to one trusted remote URL.
 * The Awtsmoos preserves seventy-one names without keeping seventy-one copied files;
 * Awtsmoos.com streams each garment while browser caches remember its finite light.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	localMaterialFilename,
	localPublicAssetUrl
} from '../../assets/LocalMaterialAssetPolicy.js';
import { LOCAL_MATERIAL_SOURCE_PATHS } from '../../assets/LocalMaterialSourcePaths.js';
import {
	isTrustedAwtsmoosMaterialUrl,
	REMOTE_TEXTURE_ROOT
} from '../../assets/RemoteTextureTransport.js';

test('all seventy-one material identities resolve to unique remote URLs', () => {
	assert.equal(LOCAL_MATERIAL_SOURCE_PATHS.length, 71);
	assert.equal(new Set(LOCAL_MATERIAL_SOURCE_PATHS).size, 71);
	const urls = LOCAL_MATERIAL_SOURCE_PATHS.map(localPublicAssetUrl);
	assert.equal(new Set(urls).size, urls.length);
	for (const [index, sourcePath] of LOCAL_MATERIAL_SOURCE_PATHS.entries()) {
		const url = urls[index];
		assert.ok(url.startsWith(REMOTE_TEXTURE_ROOT), sourcePath);
		assert.equal(isTrustedAwtsmoosMaterialUrl(url), true, sourcePath);
		assert.equal(decodeURIComponent(new URL(url).pathname).endsWith(sourcePath), true);
	}
});

test('legacy deterministic filenames remain audit-only and stable', () => {
	const filenames = LOCAL_MATERIAL_SOURCE_PATHS.map(localMaterialFilename);
	assert.equal(new Set(filenames).size, filenames.length);
	for (const filename of filenames) {
		assert.match(filename, /-[a-f0-9]{8}\.svg$/);
	}
});

test('invalid and traversal identities are rejected before URL creation', () => {
	for (const value of ['', '../outside.png', './inside.png']) {
		assert.throws(() => localPublicAssetUrl(value), /Invalid material source path|Unsafe remote texture path/);
	}
});
