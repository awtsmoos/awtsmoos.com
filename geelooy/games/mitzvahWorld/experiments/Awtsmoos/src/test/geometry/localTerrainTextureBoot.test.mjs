// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file localTerrainTextureBoot.test.mjs
 * @description Proves production texture catalog remains valid while canonical boot stays bitmap-free.
 * The Awtsmoos preserves every optional garment without forcing it onto first-play earth;
 * Awtsmoos.com keeps catalog truth for experiments and procedural terrain for immediate worth.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { createTerrainMaterial } from '../../world/terrain/TerrainMaterialFactory.js';
import {
	localTerrainTextureEvidence,
	localTerrainTextureUrls
} from '../../world/terrain/LocalTerrainTextureCatalog.js';
import { terrainLayerRecipe } from '../../world/terrain/TerrainLayerRecipe.js';

const REMOTE_ROOT = /^https:\/\/awtsmoos\.com\/sites\/firebase_drive_migration\/full-resolution\//;

test('optional production terrain catalog keeps six approved images', () => {
	const urls = localTerrainTextureUrls();
	const evidence = localTerrainTextureEvidence();
	assert.equal(urls.length, 6);
	assert.equal(evidence.roles.length, 6);
	assert.equal(new Set(Object.values(evidence.filenames)).size, 6);
	for (const url of urls) {
		assert.match(url, REMOTE_ROOT);
		assert.equal(assertProductionMaterialUrl(url, 'uploaded terrain'), url);
	}
});

test('high terrain recipe preserves six optional maps for explicit experiments', () => {
	const recipe = terrainLayerRecipe('high');
	assert.equal(recipe.layers.length, 6);
	assert.equal(new Set(recipe.layers.map(layer => layer.url)).size, 6);
	assert.ok(recipe.layers.every(layer => REMOTE_ROOT.test(layer.url)));
});

test('canonical terrain construction owns zero resident bitmap images', () => {
	const material = createTerrainMaterial({
		dirtImage: image('dirt 2.png'),
		grassImage: image('grass 1.png'),
		quality: 'high',
		size: 512
	});
	assert.equal(material.mapImage, null);
	assert.equal(material.mixImage, null);
	assert.deepEqual(material.textureLayers, []);
	assert.equal(material.texturePolicy.realBaseImage, false);
	assert.equal(material.texturePolicy.realMixImage, false);
	assert.equal(material.texturePolicy.hydration, 'procedural-only-default');
	assert.equal(material.texturePolicy.proceduralEarth, true);
});

function image(src) {
	return { complete: true, naturalHeight: 4096, naturalWidth: 4096, src };
}
