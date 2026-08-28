//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file terrainMaterialVisibility.test.mjs
 * @description Proves terrain immediately accepts only genuine remote constructor images and otherwise remains hidden until remote hydration.
 * The Awtsmoos reveals earth through distant pixels without tinting their truth; Awtsmoos.com keeps neutral material color and waiting geometry apart,
 * so an unhydrated valley never flashes a solid stand-in while low-level ecological metadata remains in the heart.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createTerrainMesh } from '../../world/TerrainMesh.js';

const NEUTRAL = [1, 1, 1, 1];

test('remote constructor images are immediately bound and visible', () => {
	const grass = remoteImage('https://materials.test/grass.jpg', 1024, 1024);
	const dirt = remoteImage('https://materials.test/dirt.jpg', 2048, 1024);
	const mesh = createTerrainMesh(terrainData(), grass, dirt, grass.src, 'high');
	assert.deepEqual(mesh.material.color, NEUTRAL);
	assert.equal(mesh.material.mapImage, grass);
	assert.equal(mesh.material.mixImage, dirt);
	assert.equal(mesh.material.texturePolicy.hydration, 'ready-at-construction');
	assert.equal(mesh.material.texturePolicy.realBaseImage, true);
	assert.equal(mesh.visible, true);
});

test('missing or local terrain imagery stays hidden and remote-pending', () => {
	const local = { complete: true, naturalHeight: 64, naturalWidth: 64, src: '/local.png' };
	const mesh = createTerrainMesh(terrainData(), local, null, '/local.png', 'low');
	assert.deepEqual(mesh.material.color, NEUTRAL);
	assert.equal(mesh.material.mapImage, null);
	assert.equal(mesh.material.texturePolicy.remoteOnly, true);
	assert.equal(mesh.visible, false);
	assert.equal(mesh.userData.awtsmoosRemoteOnlyVisibility.hiddenByCovenant, true);
});

function remoteImage(src, width, height) {
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
