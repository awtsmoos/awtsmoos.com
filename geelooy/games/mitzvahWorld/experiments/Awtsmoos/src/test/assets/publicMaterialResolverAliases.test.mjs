// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicMaterialResolverAliases.test.mjs
 * @description Protects canonical aliases while proving their generated local byte vessels.
 * The Awtsmoos preserves material meaning when a finite doorway disappears; Awtsmoos.com
 * verifies every alias keeps its source identity and hydrates without the dead public host.
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

test('redirects logged source failures to verified canonical identities', () => {
	assert.equal(
		fullMaterialPath('grass 6'),
		'awtsmoos-nature/chai-forest/textures/ground/grass.jpg'
	);
	assert.equal(
		fullMaterialPath('mud'),
		'awtsmoos-nature/chai-forest/textures/ground/dirt_color.jpg'
	);
	assert.equal(fullMaterialPath('oak wood 2'), 'full-resolution/oak wood 3.png');
	assert.equal(fullMaterialPath('stone floor'), 'full-resolution/stone floor 2.png');
	assertLocalMaterialUrl(
		assert,
		fullMaterialUrl('stone floor'),
		'/full-resolution/stone floor 2.png'
	);
});

test('unproven names keep exact canonical paths inside local URLs', () => {
	assert.equal(fullMaterialPath('stone 1'), 'full-resolution/stone 1.png');
	const stoneUrl = fullMaterialUrl('stone 1');
	assertLocalMaterialUrl(assert, stoneUrl, '/full-resolution/stone 1.png');
	assert.equal(canonicalSourcePath(stoneUrl), '/full-resolution/stone 1.png');
	assert.deepEqual(Object.keys(publicMaterialAliases()).sort(), [
		'grass 6',
		'mud',
		'oak wood 2',
		'stone floor'
	]);
});
