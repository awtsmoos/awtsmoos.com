// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainLayerRecipe.test.mjs
 * @description Proves POT ground bases, distinct ecological layers, quality limits, and zones.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { highestResolutionSurfaceEntries } from '../../assets/HighestResolutionSurfaceCatalog.js';
import { createTerrainMesh } from '../../world/TerrainMesh.js';
import { terrainLayerRecipe } from '../../world/terrain/TerrainLayerRecipe.js';

test('continuous grass and dirt use exact licensed Chai POT public URLs', () => {
	const entries = Object.fromEntries(
		highestResolutionSurfaceEntries().map(entry => [entry.role, entry.url])
	);
	assert.equal(Object.keys(entries).length, 8);
	assert.equal(
		entries.baseGrass,
		'https://awtsmoos-docs-base.web.app/awtsmoos-nature/chai-forest-half/textures/ground/grass.jpg'
	);
	assert.equal(
		entries.dirt,
		'https://awtsmoos-docs-base.web.app/awtsmoos-nature/chai-forest-half/textures/ground/dirt_color.jpg'
	);
	for (const role of ['dryGrass', 'forestFloor', 'marsh', 'mud', 'sand', 'stone']) {
		assert.match(entries[role], /\/full-resolution\//, `${role} must remain ecologically distinct`);
	}
});

test('quality recipes preserve ordered layers and bounded counts', () => {
	const medium = terrainLayerRecipe('medium');
	const low = terrainLayerRecipe('low');
	assert.equal(medium.layers.length, 6);
	assert.equal(low.layers.length, 3);
	assert.deepEqual(medium.layers.map(layer => layer.role), [
		'dryGrass',
		'mud',
		'forestFloor',
		'stone',
		'marsh',
		'sand'
	]);
	assert.ok(medium.layers.every(layer => layer.strength > 0 && layer.strength <= 1));
	assert.match(medium.baseUrl, /\/chai-forest-half\/textures\/ground\/grass\.jpg$/);
	assert.match(medium.dirtUrl, /\/chai-forest-half\/textures\/ground\/dirt_color\.jpg$/);
});

test('terrain mesh carries four ecological zones and six layered textures', () => {
	const image = completeImage('https://awtsmoos-docs-base.web.app/awtsmoos-nature/chai-forest-half/textures/ground/grass.jpg');
	const mesh = createTerrainMesh(terrainData(), image, image, image.src, 'medium');
	const zones = Array.from(mesh.geometry.attributes.zone.array);
	assert.equal(mesh.geometry.attributes.zone.itemSize, 4);
	assert.deepEqual(zones.slice(0, 3), [1, 0, 0]);
	assert.ok(Math.abs(zones[3] - 0.45) < 0.00001);
	assert.deepEqual(zones.slice(4), [
		0, 1, 0, 0,
		0, 0, 1, 0
	]);
	assert.equal(mesh.material.textureLayers.length, 6);
	assert.equal(mesh.material.texturePolicy.shader, 'terrain-layered-multi-mix');
	assert.equal(mesh.userData.AwtsmoosTerrainValley.layerCount, 6);
});

function completeImage(src) {
	return { complete: true, naturalHeight: 512, naturalWidth: 512, src };
}

function terrainData() {
	return {
		AwtsmoosTerrainValley: { zones: 4 },
		indices: [0, 1, 2],
		normals: [0, 1, 0, 0, 1, 0, 0, 1, 0],
		size: 12,
		uvs: [0, 0, 1, 0, 0, 1],
		vertices: [
			{ x: 0, y: 0, z: 0 },
			{ x: 1, y: 0, z: 0 },
			{ x: 0, y: 0, z: 1 }
		],
		zones: ['village-plaza', 'lake-basin', 'stream-channel']
	};
}
