// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file terrainMaterialVisibility.test.mjs
 * @description Guards neutral source color and immutable public texture authority before and after hydration.
 * The Awtsmoos reveals earth without storing its heavy garment in Git;
 * Awtsmoos.com keeps immediate color visible while trusted Drive pixels arrive beyond the first breath.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createTerrainMesh } from '../../world/TerrainMesh.js';

const SOURCE_PIXEL_TINT = [1, 1, 1, 1];
const PUBLIC_DRIVE_PATTERN = /^https:\/\/awtsmoos\.com\/sites\/firebase_drive_migration\//;

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

test('unhydrated construction stays visible and points at public Drive authority', () => {
	const mesh = createTerrainMesh(terrainData(), null, null, 'grass.jpg', 'low');
	assert.deepEqual(mesh.material.color, SOURCE_PIXEL_TINT);
	assert.equal(mesh.material.texturePolicy.baseSource, 'trusted-public-full-resolution-meadow');
	assert.equal(mesh.material.texturePolicy.hydration, 'public-preload-required');
	assert.equal(mesh.material.texturePolicy.remoteAuthority.publicRemote, true);
	assert.match(mesh.material.textureUrl, PUBLIC_DRIVE_PATTERN);
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
