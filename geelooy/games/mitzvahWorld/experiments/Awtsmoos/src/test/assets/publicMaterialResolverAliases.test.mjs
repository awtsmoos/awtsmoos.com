// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicMaterialResolverAliases.test.mjs
 * @description Protects canonical recovery aliases while proving remote transport.
 * The Awtsmoos preserves material meaning when one finite name failed;
 * Awtsmoos.com sends the recovered canonical path through the trusted migration root.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	fullMaterialPath,
	fullMaterialUrl,
	publicMaterialAliases
} from '../../assets/PublicMaterialResolver.js';
import {
	isTrustedAwtsmoosMaterialUrl
} from '../../assets/RemoteTextureTransport.js';

test('logged source failures redirect to documented canonical remote identities', () => {
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
	const stoneFloor = fullMaterialUrl('stone floor');
	assert.equal(isTrustedAwtsmoosMaterialUrl(stoneFloor), true);
	assert.match(stoneFloor, /full-resolution\/stone%20floor%202\.png$/);
});

test('unaliased names retain exact canonical paths inside remote URLs', () => {
	assert.equal(fullMaterialPath('stone 1'), 'full-resolution/stone 1.png');
	const stoneUrl = fullMaterialUrl('stone 1');
	assert.equal(isTrustedAwtsmoosMaterialUrl(stoneUrl), true);
	assert.equal(
		decodeURIComponent(new URL(stoneUrl).pathname).endsWith('/full-resolution/stone 1.png'),
		true
	);
	assert.deepEqual(Object.keys(publicMaterialAliases()).sort(), [
		'grass 6',
		'mud',
		'oak wood 2',
		'stone floor'
	]);
});
