// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainLayerRecipe.test.mjs
 * @description Proves sixteen real sources, many grasses, quality pages, zones, and hydration slots.
 * The Awtsmoos gives each valley one living earth; Awtsmoos.com keeps geometry immediate while
 * multiple full-source grass identities and truthful soil, mud, stone, forest, and shore remain distinct.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import {
	MOUNTAIN_VILLAGE_FAMILIES
} from '../../world/materials/MountainVillageMaterialSources.js';
import { createTerrainMesh } from '../../world/TerrainMesh.js';
import { terrainLayerRecipe } from '../../world/terrain/TerrainLayerRecipe.js';

test('quality recipes preserve sixteen logical layers and ten active high layers', () => {
	const low = terrainLayerRecipe('low');
	const medium = terrainLayerRecipe('medium');
	const high = terrainLayerRecipe('high');
	const cinematic = terrainLayerRecipe('cinematic');
	assert.equal(low.layers.length, 3);
	assert.equal(medium.layers.length, 6);
	assert.equal(high.layers.length, 10);
	assert.equal(cinematic.layers.length, 16);
	assert.equal(cinematic.logicalLayerCount, 16);
	assert.deepEqual(medium.layers.map(layer => layer.role), [
		'meadow-source-grass',
		'meadow-grass-one',
		'meadow-grass-four',
		'meadow-dry-grass',
		'meadow-wet-grass',
		'meadow-dirt-grass-one'
	]);
	assert.match(high.shader, /ten-stage-material-stack/);
});

test('terrain family exposes eight distinct grass maps and three transitions', () => {
	assert.equal(MOUNTAIN_VILLAGE_FAMILIES.grass.length, 8);
	assert.equal(new Set(MOUNTAIN_VILLAGE_FAMILIES.grass).size, 8);
	assert.equal(MOUNTAIN_VILLAGE_FAMILIES.grassTransitions.length, 3);
	const high = terrainLayerRecipe('high');
	assert.equal(new Set(high.layers.map(layer => layer.url)).size, 10);
	assert.ok(high.layers.filter(layer => layer.role.includes('grass')).length >= 7);
});

test('every terrain stack URL is a canonical production source', () => {
	const recipe = terrainLayerRecipe('cinematic');
	assert.match(recipe.baseUrl, /\/chai-forest\/textures\/ground\/grass\.jpg$/);
	assert.match(recipe.dirtUrl, /\/chai-forest\/textures\/ground\/dirt_color\.jpg$/);
	assert.equal(new Set(recipe.layers.map(layer => layer.url)).size, 16);
	for (const layer of recipe.layers) {
		assert.equal(assertProductionMaterialUrl(layer.url, layer.role), layer.url);
		assert.equal(Object.isFrozen(layer), true);
		assert.equal(layer.zones.length, 4);
		assert.equal(layer.slope.length, 2);
	}
});

test('medium terrain carries four ecological zones and six hydrated slots', () => {
	const image = completeImage(
		'https://awtsmoos-docs-base.web.app/awtsmoos-nature/chai-forest/textures/ground/grass.jpg'
	);
	const mesh = createTerrainMesh(terrainData(), image, image, image.src, 'medium');
	const zones = Array.from(mesh.geometry.attributes.zone.array);
	assert.equal(mesh.geometry.attributes.zone.itemSize, 4);
	assert.deepEqual(zones.slice(0, 3), [1, 0, 0]);
	assert.ok(Math.abs(zones[3] - 0.45) < 0.00001);
	assert.equal(mesh.material.textureLayers.length, 6);
	assert.equal(mesh.material.materialStack.logicalLayerCount, 16);
	assert.equal(
		mesh.material.texturePolicy.shader,
		'terrain-layered-ten-stage-material-stack'
	);
	assert.equal(mesh.userData.AwtsmoosTerrainValley.layerCount, 6);
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
