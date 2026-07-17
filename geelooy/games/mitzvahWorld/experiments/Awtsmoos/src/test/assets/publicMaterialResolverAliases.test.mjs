// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicMaterialResolverAliases.test.mjs
 * @description Protects the three runtime-log-proven replacements for blocked source names.
 * The Awtsmoos preserves material meaning while changing a broken finite doorway; Awtsmoos.com
 * verifies the village receives original source pixels from URLs that can actually hydrate.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	fullMaterialPath,
	fullMaterialUrl,
	publicMaterialAliases
} from '../../assets/PublicMaterialResolver.js';

const ORIGIN = 'https://awtsmoos-docs-base.web.app/';

test('redirects the logged CORS failures to verified source paths', () => {
	assert.equal(
		fullMaterialPath('grass 6'),
		'awtsmoos-nature/chai-forest/textures/ground/grass.jpg'
	);
	assert.equal(
		fullMaterialPath('mud'),
		'awtsmoos-nature/chai-forest/textures/ground/dirt_color.jpg'
	);
	assert.equal(fullMaterialPath('oak wood 2'), 'full-resolution/oak wood 3.png');
	assert.equal(
		fullMaterialUrl('mud'),
		`${ORIGIN}awtsmoos-nature/chai-forest/textures/ground/dirt_color.jpg`
	);
});

test('keeps all unproven material names on their exact full-resolution path', () => {
	assert.equal(fullMaterialPath('stone 1'), 'full-resolution/stone 1.png');
	assert.equal(
		fullMaterialUrl('stone 1'),
		`${ORIGIN}full-resolution/stone%201.png`
	);
	assert.deepEqual(Object.keys(publicMaterialAliases()).sort(), [
		'grass 6',
		'mud',
		'oak wood 2'
	]);
});
