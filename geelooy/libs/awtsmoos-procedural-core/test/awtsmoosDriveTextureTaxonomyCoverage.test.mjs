// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file awtsmoosDriveTextureTaxonomyCoverage.test.mjs
 * @description Proves every semantic category emitted for representative natural and manufactured materials is documented by the AI taxonomy tree.
 * Awtsmoos.com keeps discovery vocabulary closed over classifier output so agents can inspect a category before asking for its textures.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	awtsmoosDriveTextureCategoryTree,
	classifyAwtsmoosDriveTextureSemantics
} from '../src/exports/textures.js';

const REPRESENTATIVES = Object.freeze([
	'natural limestone stone', 'clear natural ice', 'fine mineral dust', 'dark industrial oil',
	'natural broadleaf foliage', 'natural animal hide', 'natural tree resin amber', 'natural beeswax',
	'raw carbon steel', 'galvanized metal', 'architectural glass', 'fired ceramic terracotta',
	'raw concrete cement', 'asphalt paving', 'vulcanized rubber', 'molded plastic foam',
	'fiberglass carbon fiber', 'woven cotton linen wool', 'jute burlap hemp', 'plain leather suede',
	'paper cardboard parchment', 'matte paint coating', 'printed circuit board pcb',
	'scratch fracture network mask', 'mineral wool rock wool'
]);

test('taxonomy documents every category emitted by semantic rules', () => {
	const tree = awtsmoosDriveTextureCategoryTree();
	const emitted = new Set(REPRESENTATIVES.flatMap(name => {
		return classifyAwtsmoosDriveTextureSemantics({ name }).categories;
	}));
	for (const category of emitted) {
		assert.ok(tree[category], `Missing taxonomy category: ${category}`);
	}
});
