// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainLayerRecipe.test.mjs
 * @description Proves three real grasses plus earth, marsh, and stone occupy the bounded production sampler stack.
 * The Awtsmoos lets meadow diversity remain visible without losing ecological order;
 * Awtsmoos.com verifies trusted full-resolution transport while six garments share one shader border.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { remoteFullResolutionTextureUrl } from '../../assets/RemoteTextureCatalog.js';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { createTerrainMesh } from '../../world/TerrainMesh.js';
import { terrainLayerRecipe } from '../../world/terrain/TerrainLayerRecipe.js';
import {
	completeTerrainImage,
	minimalTerrainRecipeData,
	sumTerrainWeights,
	TERRAIN_HIGH_ROLES,
	TERRAIN_SOURCE_ROLES
} from './TerrainLayerRecipeFixture.mjs';

const TERRAIN_TRANSPORT_SAMPLE = new URL(
	remoteFullResolutionTextureUrl('grass 1.png')
);
const TERRAIN_TRANSPORT_FOLDER = TERRAIN_TRANSPORT_SAMPLE.pathname.slice(
	0,
	TERRAIN_TRANSPORT_SAMPLE.pathname.lastIndexOf('/') + 1
);

test('quality recipes preserve bounded ecological capacity', () => {
	const low = terrainLayerRecipe('low');
	const medium = terrainLayerRecipe('medium');
	const high = terrainLayerRecipe('high');
	const cinematic = terrainLayerRecipe('cinematic');
	assert.equal(low.layers.length, 3);
	assert.equal(medium.layers.length, 5);
	assert.equal(high.layers.length, 6);
	assert.equal(cinematic.layers.length, 6);
	assert.equal(cinematic.logicalLayerCount, 6);
	assert.deepEqual(high.layers.map(layer => layer.role), TERRAIN_HIGH_ROLES);
	assert.deepEqual(high.layers.map(layer => layer.sourceRole), TERRAIN_SOURCE_ROLES);
	assert.deepEqual(cinematic.layers.map(layer => layer.role), TERRAIN_HIGH_ROLES);
	assert.match(high.shader, /six-stage-material-stack/);
});

test('high terrain directly binds three distinct real grass photographs', () => {
	const recipe = terrainLayerRecipe('high');
	const grass = recipe.layers.slice(0, 3);
	assert.deepEqual(grass.map(layer => layer.role), [
		'meadow-wet-grass',
		'meadow-lush-grass',
		'meadow-dry-grass'
	]);
	assert.equal(new Set(grass.map(layer => layer.url)).size, 3);
	assert.match(grass[0].url, /full-resolution\/grass%201\.png$/);
	assert.match(grass[1].url, /full-resolution\/grass%204\.png$/);
	assert.match(grass[2].url, /full-resolution\/grass%208\.png$/);
});

test('visible maps use approved uploaded terrain transport', () => {
	const recipe = terrainLayerRecipe('cinematic');
	assert.match(recipe.baseUrl, /full-resolution\/grass%201\.png$/);
	assert.match(recipe.dirtUrl, /full-resolution\/dirt%202\.png$/);
	assert.equal(new Set(recipe.layers.map(layer => layer.url)).size, 6);
	for (const layer of recipe.layers) {
		const parsed = new URL(layer.url);
		assert.equal(parsed.origin, TERRAIN_TRANSPORT_SAMPLE.origin);
		assert.equal(parsed.pathname.startsWith(TERRAIN_TRANSPORT_FOLDER), true);
		assert.equal(assertProductionMaterialUrl(layer.url, layer.role), layer.url);
		assert.equal(assertProductionMaterialUrl(layer.publicUrl, layer.sourceRole), layer.publicUrl);
		assert.equal(layer.zones.length, 4);
		assert.equal(layer.slope.length, 2);
	}
});

test('medium terrain carries normalized mixed ecological weights and five slots', () => {
	const image = completeTerrainImage(remoteFullResolutionTextureUrl('grass 1.png'));
	const mesh = createTerrainMesh(
		minimalTerrainRecipeData(),
		image,
		image,
		image.src,
		'medium'
	);
	const weights = Array.from(mesh.geometry.attributes.zone.array.slice(0, 4));
	assert.equal(mesh.geometry.attributes.zone.itemSize, 4);
	assert.ok(weights.every(Number.isFinite));
	assert.ok(Math.abs(sumTerrainWeights(weights) - 1) < 0.00001);
	assert.equal(mesh.material.textureLayers.length, 5);
	assert.equal(mesh.material.materialStack.logicalLayerCount, 6);
	assert.equal(mesh.material.texturePolicy.shader, 'terrain-layered-six-stage-material-stack');
	assert.equal(mesh.userData.AwtsmoosTerrainValley.layerCount, 5);
});
