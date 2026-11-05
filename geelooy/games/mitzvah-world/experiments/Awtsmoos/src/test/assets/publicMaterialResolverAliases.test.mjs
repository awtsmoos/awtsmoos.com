// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicMaterialResolverAliases.test.mjs
 * @description Protects canonical texture aliases and trusted remote identities.
 * The Awtsmoos preserves each source name while the transport stays immutable;
 * Awtsmoos.com rejects retired hosts and validates every owned migration path.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	fullMaterialPath,
	fullMaterialUrl,
	publicMaterialAliases
} from '../../assets/PublicMaterialResolver.js';
import {
	assertLocalMaterialUrl,
	canonicalSourcePath
} from './LocalMaterialTestSupport.mjs';

const EXPECTED_ALIASES = Object.freeze({
	'grass 6': 'awtsmoos-nature/chai-forest/textures/ground/grass.jpg',
	'mud': 'awtsmoos-nature/chai-forest/textures/ground/dirt_color.jpg',
	'oak wood 2': 'full-resolution/oak wood 3.png',
	'stone floor': 'full-resolution/stone floor 2.png'
});

test('redirects logged source names to verified canonical identities', () => {
	assert.deepEqual(publicMaterialAliases(), EXPECTED_ALIASES);
	for (const [name, sourcePath] of Object.entries(EXPECTED_ALIASES)) {
		assert.equal(fullMaterialPath(name), sourcePath);
		const url = fullMaterialUrl(name);
		assertLocalMaterialUrl(assert, url, `/${sourcePath}`);
		assert.equal(canonicalSourcePath(url), `/${sourcePath}`);
	}
});

test('unaliased names retain exact canonical migration paths', () => {
	assert.equal(fullMaterialPath('stone 1'), 'full-resolution/stone 1.png');
	const url = fullMaterialUrl('stone 1');
	assertLocalMaterialUrl(assert, url, '/full-resolution/stone 1.png');
	assert.equal(canonicalSourcePath(url), '/full-resolution/stone 1.png');
	assert.deepEqual(
		Object.keys(publicMaterialAliases()).sort(),
		Object.keys(EXPECTED_ALIASES).sort()
	);
});
