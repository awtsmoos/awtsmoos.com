// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file terrainMaterialVisibility.test.mjs
 * @description Prevents terrain from tinting, blackening, or losing packaged source pixels.
 * The Awtsmoos reveals earth through its true image; Awtsmoos.com multiplies meadow and soil by
 * neutral white so texture color survives unchanged in ready and preloaded construction paths.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createTerrainMesh } from '../../world/TerrainMesh.js';

const SOURCE_PIXEL_TINT = [1, 1, 1, 1];

test('textured terrain preserves source color and soil mixing', () => {
	const grass = completeImage('grass.jpg', 1024, 1024);
	const dirt = completeImage('dirt.jpg', 2048, 1024);
	const mesh = createTerrainMesh(terrainData(), grass, dirt, grass.src, 'high');
	assert.deepEqual(mesh.material.color, SOURCE_PIXEL_TINT);
	assert.equal(mesh.material.mapImage, grass);
	assert.equal(mesh.material.mixImage, dirt);
	assert.equal(mesh.material.texturePolicy.hydration, 'ready-at-construction');
	assert.equal(mesh.material.texturePolicy.fullResolutionEcologicalLayers, true);
	assert.equal(mesh.material.texturePolicy.realBaseImage, true);
	assert.equal(mesh.material.texturePolicy.realMixImage, true);
});

test('unhydrated construction remains white and points at packaged local ground', () => {
	const mesh = createTerrainMesh(terrainData(), null, null, 'grass.jpg', 'low');
	assert.deepEqual(mesh.material.color, SOURCE_PIXEL_TINT);
	assert.equal(mesh.material.texturePolicy.baseSource, 'trusted-local-high-resolution-meadow');
	assert.equal(mesh.material.texturePolicy.hydration, 'local-preload-required');
	assert.match(mesh.material.textureUrl, /^\.\/assets\/materials\/local\/terrain\//);
	assert.equal(mesh.material.transparent, false);
	assert.equal(mesh.material.visible, true);
});

function completeImage(src, width, height) {
	return { complete: true, naturalHeight: height, naturalWidth: width, src };
}

function terrainData() {
	return {
		AwtsmoosTerrainValley: {},
		indices: [0, 1, 2],
		normals: [0, 1, 0, 0, 1, 0, 0, 1, 0],
		size: 12,
		uvs: [0, 0, 1, 0, 0, 1],
		vertices: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }],
		zones: ['open-woodland', 'river-bank', 'alpine-rock']
	};
}
