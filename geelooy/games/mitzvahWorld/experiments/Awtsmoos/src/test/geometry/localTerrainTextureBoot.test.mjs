// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file localTerrainTextureBoot.test.mjs
 * @description Proves packaged high-resolution ground maps bind before terrain construction.
 * The Awtsmoos joins earth and garment in one boot moment; Awtsmoos.com refuses a blank valley
 * by requiring meadow, soil, mud, stone, leaf-floor, and shore to exist beside the application.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { createTerrainMaterial } from '../../world/terrain/TerrainMaterialFactory.js';
import {
	localTerrainTextureUrls
} from '../../world/terrain/LocalTerrainTextureCatalog.js';
import { terrainLayerRecipe } from '../../world/terrain/TerrainLayerRecipe.js';

const GAME_ROOT = fileURLToPath(new URL('../../../../../', import.meta.url));

test('all six local terrain images exist and contain real bytes', () => {
	const urls = localTerrainTextureUrls();
	assert.equal(urls.length, 6);
	for (const url of urls) {
		assert.equal(assertProductionMaterialUrl(url, 'local terrain'), url);
		const path = `${GAME_ROOT}${url.replace(/^\.\//, '')}`;
		assert.equal(fs.existsSync(path), true, path);
		assert.ok(fs.statSync(path).size > 10000, path);
	}
});

test('high terrain recipe exposes six distinct same-origin maps', () => {
	const recipe = terrainLayerRecipe('high');
	assert.equal(recipe.layers.length, 6);
	assert.equal(new Set(recipe.layers.map(layer => layer.url)).size, 6);
	assert.ok(recipe.layers.every(layer => layer.url.startsWith('./assets/materials/local/terrain/')));
	assert.ok(recipe.layers.every(layer => /^https:\/\//.test(layer.publicUrl)));
});

test('terrain binds a real meadow base and earth mix at construction', () => {
	const grassImage = image('./assets/materials/local/terrain/meadow-wet-grass.png');
	const dirtImage = image('./assets/materials/local/terrain/worn-earth.jpg');
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
		naturalHeight: 2048,
		naturalWidth: 2048,
		src
	};
}
