// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file awtsmoosDriveTextureTaxonomy.test.mjs
 * @description Proves AI categories, PBR channels, family assembly, and albedo-only mixing are intrinsic to the reusable Drive library.
 * The Awtsmoos joins many finite maps without confusion; Awtsmoos.com lets AI find one bark family while renderers receive each channel in its proper place.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	awtsmoosDriveTextureCategoryTree,
	compileAwtsmoosDrivePbrFamilies,
	compileAwtsmoosDriveTextureLibrary,
	createAwtsmoosDriveTextureMixPlan,
	searchAwtsmoosDrivePbrFamilies,
	searchAwtsmoosDriveTextureLibrary
} from '../src/exports/textures.js';

const paths = [
	'bark/Bark001_Color.jpg',
	'bark/Bark001_NormalGL.jpg',
	'bark/Bark001_Roughness.jpg',
	'village/centuries-old-stone-paving.png'
];
const materials = {
	records: paths.map((path, index) => ({
		id: `m${index}`,
		kind: 'image',
		name: path.split('/').pop(),
		path: `full-resolution/${path}`,
		resolution: 'source',
		tags: path.startsWith('bark/') ? ['bark', 'pbr'] : ['stone'],
		variantKey: `full-resolution/${path.toLowerCase()}`,
		variants: { source: `full-resolution/${path}` }
	})),
	schema: 'awtsmoos-material-catalog/v1'
};
const inventory = {
	assets: paths.map((path, index) => ({
		kind: 'image',
		path: `full-resolution/${path}`,
		role: 'canonical-source',
		sha256: `hash-${index}`
	})),
	schema: 'awtsmoos-asset-organization/v1'
};

test('AI category tree exposes reusable material domains and subdomains', () => {
	const tree = awtsmoosDriveTextureCategoryTree();
	assert.equal(typeof tree.terrain.rock, 'string');
	assert.equal(typeof tree.architecture.masonry, 'string');
	assert.equal(typeof tree.vegetation.bark, 'string');
	assert.equal(typeof tree.water.surface, 'string');
});

test('PBR maps become one categorized material family with distinct channels', () => {
	const library = compileAwtsmoosDriveTextureLibrary(materials, inventory);
	const bark = searchAwtsmoosDriveTextureLibrary(library, '', { category: 'vegetation', subcategory: 'bark' });
	assert.deepEqual(new Set(bark.map(texture => texture.channel)), new Set(['albedo', 'normal-gl', 'roughness']));
	const pbr = compileAwtsmoosDrivePbrFamilies(library);
	const [family] = searchAwtsmoosDrivePbrFamilies(pbr, 'bark001', { requireChannels: ['albedo', 'normal-gl', 'roughness'] });
	assert.equal(family.category, 'vegetation');
	assert.ok(family.channels.albedo);
	assert.ok(family.channels['normal-gl']);
	assert.ok(family.channels.roughness);
});

test('runtime mixing defaults to photographed albedo and excludes PBR support maps', () => {
	const library = compileAwtsmoosDriveTextureLibrary(materials, inventory);
	const plan = createAwtsmoosDriveTextureMixPlan(library, { layers: 10, seed: 11 });
	assert.ok(plan.layers.length >= 2);
	assert.ok(plan.layers.every(layer => !/normal|roughness/i.test(layer.path)));
});
