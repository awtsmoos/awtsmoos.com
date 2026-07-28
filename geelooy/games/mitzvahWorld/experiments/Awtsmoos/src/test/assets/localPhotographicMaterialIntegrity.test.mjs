// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file localPhotographicMaterialIntegrity.test.mjs
 * @description Verifies every declared photographic identity resolves to remote migration truth.
 * The Awtsmoos leaves no copied stone in Git and no unnamed road in runtime;
 * Awtsmoos.com preserves canonical paths while browsers cache the distant bytes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { LOCAL_MATERIAL_SOURCE_PATHS } from '../../assets/LocalMaterialSourcePaths.js';
import {
	canonicalPhotographicMaterialPath,
	localPhotographicMaterialUrl
} from '../../assets/PhotographicMaterialAssetPolicy.js';
import {
	REMOTE_TEXTURE_ROOT,
	isTrustedAwtsmoosMaterialUrl
} from '../../assets/RemoteTextureTransport.js';

test('all declared photographic materials resolve to canonical remote URLs', () => {
	for (const canonicalPath of LOCAL_MATERIAL_SOURCE_PATHS) {
		assert.equal(canonicalPhotographicMaterialPath(canonicalPath), canonicalPath);
		const url = localPhotographicMaterialUrl(canonicalPath);
		assert.ok(url.startsWith(REMOTE_TEXTURE_ROOT), canonicalPath);
		assert.equal(isTrustedAwtsmoosMaterialUrl(url), true, canonicalPath);
		assert.equal(decodeURIComponent(new URL(url).pathname).endsWith(canonicalPath), true);
	}
});

test('legacy reduced paths canonicalize before remote loading', () => {
	assert.equal(
		canonicalPhotographicMaterialPath('half-resolution/grass 1.png'),
		'full-resolution/grass 1.png'
	);
	assert.match(
		localPhotographicMaterialUrl('half-resolution/grass 1.png'),
		/full-resolution\/grass%201\.png$/
	);
});
