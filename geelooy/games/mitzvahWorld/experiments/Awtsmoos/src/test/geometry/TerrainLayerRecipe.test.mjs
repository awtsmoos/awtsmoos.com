// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainLayerRecipe.test.mjs
 * @description Proves sixteen logical sources and a biome-diverse bounded gameplay subset.
 * The Awtsmoos gives one valley many possible garments; Awtsmoos.com accepts generated or public
 * production sources while shader work stays bounded across meadow, earth, bank, rock, and shore.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { MOUNTAIN_VILLAGE_FAMILIES } from '../../world/materials/MountainVillageMaterialSources.js';
import { createTerrainMesh } from '../../world/TerrainMesh.js';
import { terrainLayerRecipe } from '../../world/terrain/TerrainLayerRecipe.js';

const HIGH_ROLES = [
	'meadow-wet-grass',
	'worn-earth',
	'stream-bank-mud',
	'mountain-stone',
	'forest-leaf-floor',
	'shore-sand'
];

test('quality recipes preserve sixteen logical sources and bounded active roles', () => {
	const low = terrainLayerRecipe('low');
	const medium = terrainLayerRecipe('medium');
	const high = terrainLayerRecipe('high');
	const cinematic = terrainLayerRecipe('cinematic');
	assert.equal(low.layers.length, 3);
	assert.equal(medium.layers.length, 5);
	assert.equal(high.layers.length, 6);
	assert.equal(cinematic.layers.length, 6);
	assert.equal(cinematic.logicalLayerCount, 16);
	assert.deepEqual(high.layers.map(layer => layer.role), HIGH_ROLES);
	assert.deepEqual(cinematic.layers.map(layer => layer.role), HIGH_ROLES);
	assert.match(high.shader, /six-stage-material-stack/);
});

test('logical terrain family retains eight grass maps and three transitions', () => {
	assert.equal(MOUNTAIN_VILLAGE_FAMILIES.grass.length, 8);
	assert.equal(new Set(MOUNTAIN_VILLAGE_FAMILIES.grass).size, 8);
	assert.equal(MOUNTAIN_VILLAGE_FAMILIES.grassTransitions.length, 3);
	const recipe = terrainLayerRecipe('high');
	assert.equal(new Set(recipe.stack.layers.map(layer => layer.url)).size, 16);
	assert.equal(new Set(recipe.layers.map(layer => layer.url)).size, 6);
});

test('every logical stack URL remains a canonical production source', () => {
	const recipe = terrainLayerRecipe('cinematic');
	assert.match(recipe.baseUrl, /(?:ground\/grass|ground-grass)/i);
	assert.match(recipe.dirtUrl, /(?:ground\/dirt_color|ground-dirt-color)/i);
	for (const layer of recipe.stack.layers) {
		assert.equal(assertProductionMaterialUrl(layer.url, layer.role), layer.url);
		assert.equal(Object.isFrozen(layer), true);
		assert.equal(layer.zones.length, 4);
		assert.equal(layer.slope.length, 2);
	}
});

test('medium terrain carries four zones and five hydrated ecological slots', () => {
	const image = completeImage('https://materials.test/ground/grass.jpg');
	const mesh = createTerrainMesh(terrainData(), image, image, image.src, 'medium');
	const zones = Array.from(mesh.geometry.attributes.zone.array);
	assert.equal(mesh.geometry.attributes.zone.itemSize, 4);
	assert.deepEqual(zones.slice(0, 3), [1, 0, 0]);
	assert.ok(Math.abs(zones[3] - 0.45) < 0.00001);
	assert.equal(mesh.material.textureLayers.length, 5);
	assert.equal(mesh.material.materialStack.logicalLayerCount, 16);
	assert.equal(mesh.material.texturePolicy.shader, 'terrain-layered-six-stage-material-stack');
	assert.equal(mesh.userData.AwtsmoosTerrainValley.layerCount, 5);
});

function completeImage(src) {
	return { complete: true, naturalHeight: 1024, naturalWidth: 1024, src };
}

function terrainData() {
	return {
		AwtsmoosTerrainValley: { zones: 4 },
		indices: [0, 1, 2],
		normals: [0, 1, 0, 0, 1, 0, 0, 1, 0],
		size: 12,
		uvs: [0, 0, 1, 0, 0, 1],
		vertices: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }],
		zones: ['village-plaza', 'lake-basin', 'stream-channel']
	};
}
