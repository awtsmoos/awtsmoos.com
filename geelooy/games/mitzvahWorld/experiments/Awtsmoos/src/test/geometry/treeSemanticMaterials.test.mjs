// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeSemanticMaterials.test.mjs
 * @description Proves every required species keeps its exact remote bark/leaf identity while bark alone receives subtle Chai weather blending.
 * The Awtsmoos clothes each procedural tree according to species while Awtsmoos.com lets one shared bark memory cross the trunk in measured patches of light;
 * leaf silhouettes remain single alpha masks, so added realism deepens wood without muddying the living edge of branch and sight.
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
import {
	createTreeBarkMaterial,
	createTreeLeafMaterial
} from '../../world/trees/ForestMaterialFactory.js';

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

test('bark keeps species identity while adding one distinct Chai weathering source', () => {
	const bark = createTreeBarkMaterial('bark_willow', {
		textureScale: { x: 2.2, y: 7.5 }
	});
	assert.match(bark.textureUrl, /willow%20bark\.png$/);
	assert.match(bark.textureUrl, REMOTE_ROOT);
	assert.match(bark.mixTextureUrl, REMOTE_ROOT);
	assert.match(bark.mixTextureUrl, /chai-forest\/textures\/bark/);
	assert.notEqual(bark.textureUrl, bark.mixTextureUrl);
	assert.ok(bark.mixStrength > 0);
	assert.ok(bark.mixPatchScale > 0);
	assert.equal(bark.texturePolicy.samplersPerSurface, 2);
	assert.equal(bark.texturePolicy.blendLaw, 'gpu-world-patch-mix');
	assert.deepEqual(bark.userData.AwtsmoosForestMaterial.publicUrls, [
		bark.textureUrl,
		bark.mixTextureUrl
	]);
});

test('leaf materials preserve one exact alpha source and never activate blob or mix fallbacks', () => {
	const material = createTreeLeafMaterial('leaf_willow', { alphaTest: 0.4 });
	assert.equal(material.mapImageFallback, false);
	assert.equal(material.texturePolicy.hideUntilHydrated, true);
	assert.equal(material.texturePolicy.fullResolution, true);
	assert.equal(material.texturePolicy.samplersPerSurface, 1);
	assert.equal(material.texturePolicy.blendLaw, 'single-alpha-mask');
	assert.equal(material.alphaMode, 'MASK');
	assert.equal(material.transparent, false);
	assert.equal(material.mixTextureUrl, null);
	assert.equal(material.mixStrength, 0);
	assert.match(material.textureUrl, /willow%20leaf\.png$/);
	assert.deepEqual(material.userData.AwtsmoosForestMaterial.publicUrls, [material.textureUrl]);
});
