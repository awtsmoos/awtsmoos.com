// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeSemanticMaterials.test.mjs
 * @description Proves every required species resolves through the supplied Awtsmoos filename library.
 * The Awtsmoos clothes each procedural tree with a truthful bark and leaf identity; Awtsmoos.com
 * keeps filenames distinct while one approved transport root replaces the obsolete external host.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	REQUIRED_TREE_BARK_TYPES,
	REQUIRED_TREE_LEAF_TYPES
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/geometry/generators/tree/treeMaterialCatalog.js';
import {
	TREE_BARK_TEXTURE_TYPES,
	TREE_LEAF_TEXTURE_TYPES,
	treeBarkTextureUrl,
	treeLeafTextureUrl,
	treeSemanticTextureFilenames
} from '../../world/trees/TreeSemanticMaterialCatalog.js';
import { createTreeLeafMaterial } from '../../world/trees/ForestMaterialFactory.js';

const REMOTE_ROOT = /^https:\/\/awtsmoos\.com\/sites\/firebase_drive_migration\//;

test('every required core bark and living leaf uses an approved uploaded URL', () => {
	for (const type of REQUIRED_TREE_BARK_TYPES) {
		assert.ok(TREE_BARK_TEXTURE_TYPES.includes(type), type);
		assert.match(treeBarkTextureUrl(type), REMOTE_ROOT, type);
	}
	for (const type of REQUIRED_TREE_LEAF_TYPES) {
		assert.ok(TREE_LEAF_TEXTURE_TYPES.includes(type), type);
		assert.match(treeLeafTextureUrl(type), REMOTE_ROOT, type);
	}
	for (const filename of treeSemanticTextureFilenames()) {
		assert.equal(filename.includes('://'), false);
		assert.equal(filename.includes('%20'), false);
	}
});

test('leaf materials never activate a procedural blob fallback', () => {
	const material = createTreeLeafMaterial('leaf_willow', { alphaTest: 0.4 });
	assert.equal(material.mapImageFallback, false);
	assert.equal(material.texturePolicy.hideUntilHydrated, true);
	assert.equal(material.texturePolicy.fullResolution, true);
	assert.equal(material.alphaMode, 'MASK');
	assert.equal(material.transparent, false);
	assert.match(material.textureUrl, /willow%20leaf\.png$/);
});
