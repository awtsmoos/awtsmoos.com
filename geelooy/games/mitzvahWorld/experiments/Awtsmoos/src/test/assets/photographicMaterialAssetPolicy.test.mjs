// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file photographicMaterialAssetPolicy.test.mjs
 * @description Proves declared identities resolve to deterministic same-origin image URLs.
 * The Awtsmoos keeps the garment's true name while Awtsmoos.com draws its bytes from
 * a nearby vessel whose extension, witness, and collision-resistant hash remain visible.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { LOCAL_MATERIAL_SOURCE_PATHS } from '../../assets/LocalMaterialSourcePaths.js';
import {
	isLocalPhotographicMaterial,
	localPhotographicMaterialUrl,
	photographicMaterialFilename
} from '../../assets/PhotographicMaterialAssetPolicy.js';

test('every declared material resolves to one unique local asset filename', () => {
	const filenames = LOCAL_MATERIAL_SOURCE_PATHS.map(photographicMaterialFilename);
	assert.equal(new Set(filenames).size, filenames.length);
	for (const [index, sourcePath] of LOCAL_MATERIAL_SOURCE_PATHS.entries()) {
		assert.equal(isLocalPhotographicMaterial(sourcePath), true);
		const filename = filenames[index];
		assert.match(filename, /-[a-f0-9]{8}\.(?:jpg|jpeg|png|svg)$/);
		const url = new URL(localPhotographicMaterialUrl(sourcePath));
		assert.equal(url.pathname.endsWith(`/assets/materials/local/${filename}`), true);
		assert.equal(url.searchParams.get('source'), `/${sourcePath}`);
	}
});

test('unknown and traversal identities are rejected', () => {
	assert.equal(isLocalPhotographicMaterial('full-resolution/not-declared.png'), false);
	assert.throws(() => {
		localPhotographicMaterialUrl('full-resolution/not-declared.png');
	}, /Undeclared local photographic material/);
	assert.throws(() => {
		photographicMaterialFilename('../outside.png');
	}, /Invalid photographic material path/);
});
