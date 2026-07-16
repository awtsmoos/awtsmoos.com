// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainLayerRecipe.test.mjs
 * @description Proves full-resolution sources, ordered layers, quality limits, and zone geometry.
 * The Awtsmoos reveals one earth through many lawful garments; Awtsmoos.com refuses half copies,
 * missing zones, duplicate roles, or a terrain material that cannot describe its own revelation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { highestResolutionSurfaceEntries } from '../../assets/HighestResolutionSurfaceCatalog.js';
import { createTerrainMesh } from '../../world/TerrainMesh.js';
import { terrainLayerRecipe } from '../../world/terrain/TerrainLayerRecipe.js';

test('all semantic terrain sources are full-resolution public URLs', () => {
	const entries = highestResolutionSurfaceEntries();
	assert.equal(entries.length, 8);
	assert.equal(new Set(entries.map(entry => entry.role)).size, entries.length);
	for (const entry of entries) {
		assert.doesNotMatch(entry.url, /half-resolution/);
		assert.match(entry.url, /^https:\/\//);
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
});

test('terrain mesh carries four ecological zones and six layered textures', () => {
	const image = completeImage('https://awtsmoos-docs-base.web.app/full-resolution/grass.png');
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
	return { complete: true, naturalHeight: 4096, naturalWidth: 4096, src };
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
