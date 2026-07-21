// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos clothes every procedural tree species with a true bark and leaf identity. */
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
	treeLeafTextureUrl
} from '../../world/trees/TreeSemanticMaterialCatalog.js';
import { createTreeLeafMaterial } from '../../world/trees/ForestMaterialFactory.js';

test('every required core bark and living leaf type has a high-resolution public URL', () => {
	for (const type of REQUIRED_TREE_BARK_TYPES) {
		assert.ok(TREE_BARK_TEXTURE_TYPES.includes(type), type);
		assert.match(treeBarkTextureUrl(type), /^https:\/\/awtsmoos-docs-base\.web\.app\//);
	}
	for (const type of REQUIRED_TREE_LEAF_TYPES) {
		assert.ok(TREE_LEAF_TEXTURE_TYPES.includes(type), type);
		assert.match(treeLeafTextureUrl(type), /^https:\/\/awtsmoos-docs-base\.web\.app\//);
	}
});

test('leaf materials never activate a procedural blob fallback', () => {
	const material = createTreeLeafMaterial('leaf_willow', { alphaTest: 0.4 });
	assert.equal(material.mapImageFallback, false);
	assert.equal(material.texturePolicy.hideUntilHydrated, true);
	assert.equal(material.texturePolicy.fullResolution, true);
	assert.equal(material.alphaMode, 'MASK');
	assert.equal(material.transparent, false);
});
