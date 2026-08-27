// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file localTerrainTextureBoot.test.mjs
 * @description Proves six approved uploaded terrain maps bind before terrain construction.
 * The Awtsmoos joins earth and garment in one boot moment; Awtsmoos.com refuses a blank valley
 * by requiring meadow, soil, mud, stone, leaf-floor, and shore through one trusted remote origin.
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

test('all six uploaded terrain images use approved filename transport', () => {
	const urls = localTerrainTextureUrls();
	const evidence = localTerrainTextureEvidence();
	assert.equal(urls.length, 6);
	assert.equal(evidence.roles.length, 6);
	assert.equal(new Set(Object.values(evidence.filenames)).size, 6);
	for (const url of urls) {
		assert.match(url, REMOTE_ROOT);
		assert.equal(assertProductionMaterialUrl(url, 'uploaded terrain'), url);
	}
	for (const filename of Object.values(evidence.filenames)) {
		assert.equal(filename.includes('://'), false);
		assert.equal(filename.includes('%20'), false);
	}
});

test('high terrain recipe exposes six distinct approved maps and source roles', () => {
	const recipe = terrainLayerRecipe('high');
	assert.equal(recipe.layers.length, 6);
	assert.equal(new Set(recipe.layers.map(layer => layer.url)).size, 6);
	assert.ok(recipe.layers.every(layer => REMOTE_ROOT.test(layer.url)));
	assert.ok(recipe.layers.every(layer => {
		return assertProductionMaterialUrl(layer.publicUrl, layer.sourceRole) === layer.publicUrl;
	}));
});

test('terrain binds a real meadow base and earth mix at construction', () => {
	const grassImage = image('dirt grass 6.png');
	const dirtImage = image('dirt 2.png');
	const material = createTerrainMaterial({
		dirtImage,
		grassImage,
		quality: 'high',
		size: 512
	});
	assert.equal(material.mapImage, grassImage);
	assert.equal(material.mixImage, dirtImage);
	assert.equal(material.texturePolicy.realBaseImage, true);
	assert.equal(material.texturePolicy.realMixImage, true);
	assert.equal(material.texturePolicy.hydration, 'ready-at-construction');
	assert.equal(material.textureLayers.length, 6);
});

function image(src) {
	return {
		complete: true,
		naturalHeight: 4096,
		naturalWidth: 4096,
		src
	};
}
