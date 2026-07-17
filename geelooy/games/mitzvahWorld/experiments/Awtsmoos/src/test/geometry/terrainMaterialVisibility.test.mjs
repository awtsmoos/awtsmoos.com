// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file terrainMaterialVisibility.test.mjs
 * @description Prevents asynchronously hydrated terrain from beginning or remaining black.
 * The Awtsmoos reveals earth through color and texture together; Awtsmoos.com verifies that
 * neutral source multiplication survives both the waiting state and the fully hydrated state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createTerrainMesh } from '../../world/TerrainMesh.js';

const NEUTRAL_TERRAIN_TINT = [0.94, 0.98, 0.90, 1];

test('textured terrain preserves visible source color and soil mixing', () => {
	const grass = completeImage('grass.jpg', 1024, 1024);
	const dirt = completeImage('dirt.jpg', 2048, 1024);
	const mesh = createTerrainMesh(terrainData(), grass, dirt, grass.src, 'high');
	assert.deepEqual(mesh.material.color, NEUTRAL_TERRAIN_TINT);
	assert.equal(mesh.material.mapImage, grass);
	assert.equal(mesh.material.mixImage, dirt);
	assert.equal(mesh.material.texturePolicy.hydration, 'ready-at-construction');
	assert.equal(mesh.material.texturePolicy.fullResolutionEcologicalLayers, true);
});

test('deferred terrain hydration starts with the same neutral source tint', () => {
	const mesh = createTerrainMesh(terrainData(), null, null, 'grass.jpg', 'low');
	assert.deepEqual(mesh.material.color, NEUTRAL_TERRAIN_TINT);
	assert.equal(mesh.material.texturePolicy.baseSource, 'canonical-original-pixels-with-neutral-physical-tint');
	assert.equal(mesh.material.texturePolicy.hydration, 'deferred-residency');
	assert.equal(mesh.material.textureUrl, 'grass.jpg');
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
