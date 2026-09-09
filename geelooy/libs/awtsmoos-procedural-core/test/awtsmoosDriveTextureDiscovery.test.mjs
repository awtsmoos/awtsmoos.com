// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file awtsmoosDriveTextureDiscovery.test.mjs
 * @description Proves overlapping semantic labels and explainable ranking let AI discover materials beyond one filename category.
 * The Awtsmoos is beyond every query; Awtsmoos.com gives finite agents deterministic evidence for finding the right remote garment.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	classifyAwtsmoosDriveTextureSemantics,
	discoverAwtsmoosDriveTextures
} from '../src/exports/textures.js';

const limestone = texture('limestone', 'Natural rough limestone building stone');
const rubber = texture('rubber', 'Black vulcanized rubber dense flexible elastomer');
const library = { textures: [limestone, rubber] };

test('one material can belong to several useful AI categories', () => {
	const semantics = classifyAwtsmoosDriveTextureSemantics({
		name: 'natural limestone.png',
		sourceDescription: 'Natural rough limestone building stone'
	});
	assert.ok(semantics.categories.includes('geology'));
	assert.ok(semantics.categories.includes('terrain'));
	assert.ok(semantics.categories.includes('construction'));
	assert.ok(semantics.labels.includes('rough'));
});

test('AI discovery ranks semantic intent and explains matching terms', () => {
	const [result] = discoverAwtsmoosDriveTextures(library, 'rough limestone masonry', { limit: 1 });
	assert.equal(result.texture.id, 'limestone');
	assert.ok(result.score > 0);
	assert.ok(result.matchedTerms.includes('limestone'));
});

function texture(id, sourceDescription) {
	const semantics = classifyAwtsmoosDriveTextureSemantics({ name: `${id}.png`, sourceDescription });
	return {
		...semantics,
		aliases: [],
		channel: 'albedo',
		id,
		name: `${id}.png`,
		path: `full-resolution/${id}.png`,
		tags: []
	};
}
