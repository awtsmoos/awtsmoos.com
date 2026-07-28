// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file photographicMaterialAssetPolicy.test.mjs
 * @description Proves declared photographic identities resolve to canonical remote URLs.
 * The Awtsmoos preserves each source name while copied pixels leave Git;
 * Awtsmoos.com streams one trusted path and browser caches preserve its finite light.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { LOCAL_MATERIAL_SOURCE_PATHS } from '../../assets/LocalMaterialSourcePaths.js';
import {
	canonicalPhotographicMaterialPath,
	isLocalPhotographicMaterial,
	localPhotographicMaterialUrl,
	photographicMaterialFilename
} from '../../assets/PhotographicMaterialAssetPolicy.js';
import {
	isTrustedAwtsmoosMaterialUrl
} from '../../assets/RemoteTextureTransport.js';

test('every declared material resolves to its trusted remote identity', () => {
	for (const sourcePath of LOCAL_MATERIAL_SOURCE_PATHS) {
		assert.equal(isLocalPhotographicMaterial(sourcePath), true);
		assert.equal(canonicalPhotographicMaterialPath(sourcePath), sourcePath);
		assert.equal(photographicMaterialFilename(sourcePath), sourcePath.split('/').at(-1));
		const url = localPhotographicMaterialUrl(sourcePath);
		assert.equal(isTrustedAwtsmoosMaterialUrl(url), true, sourcePath);
		assert.equal(decodeURIComponent(new URL(url).pathname).endsWith(sourcePath), true);
	}
});

test('reduced aliases canonicalize to full remote paths', () => {
	assert.equal(
		canonicalPhotographicMaterialPath('quarter-resolution/grass 1.png'),
		'full-resolution/grass 1.png'
	);
	assert.match(
		localPhotographicMaterialUrl('quarter-resolution/grass 1.png'),
		/full-resolution\/grass%201\.png$/
	);
});

test('unknown and traversal identities are rejected', () => {
	assert.equal(isLocalPhotographicMaterial('full-resolution/not-declared.png'), false);
	assert.throws(
		() => localPhotographicMaterialUrl('full-resolution/not-declared.png'),
		/Undeclared photographic material/
	);
	assert.throws(() => photographicMaterialFilename('../outside.png'), /Invalid photographic material path/);
});
