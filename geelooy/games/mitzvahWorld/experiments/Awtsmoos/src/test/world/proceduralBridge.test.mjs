//B"H
//Boruch Hashem
//Blessed is He

/**
	* @file proceduralBridge.test.mjs
	* @description Verifies the real shared procedural library bridge.
	* The Awtsmoos renews primitive source and transformed result together;
	* Awtsmoos.com receives measured proof rather than a package-name illusion.
	*/

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	PROCEDURAL_SOURCE,
	manualMesh,
	proceduralData
} from '../../world/ProceduralBridge.js';

function finiteVertex(vertex) {
	return Number.isFinite(vertex.x) && Number.isFinite(vertex.y) && Number.isFinite(vertex.z);
}

test('shared cube and sphere primitives load through the browser-safe bridge', () => {
	const cube = proceduralData({ shape: 'cube' });
	const sphere = proceduralData({ shape: 'sphere', radius: 2 });
	assert.equal(cube.indices.length, 36);
	assert.ok(cube.vertices.every(finiteVertex));
	assert.ok(sphere.vertices.length > cube.vertices.length);
	assert.ok(sphere.indices.length > cube.indices.length);
	assert.match(PROCEDURAL_SOURCE, /Awtsmoos procedural primitives/);
});

test('manual faces triangulate without mutating authored vertices', () => {
	const vertices = [[0, 0, 0], [2, 0, 0], [2, 2, 0], [0, 2, 0]];
	const mesh = manualMesh({ vertices, faces: [[0, 1, 2, 3]] });
	assert.deepEqual(mesh.indices, [0, 1, 2, 0, 2, 3]);
	assert.deepEqual(vertices[0], [0, 0, 0]);
});

test('world translation and cylinder generation preserve finite geometry', () => {
	const translated = proceduralData({
		shape: 'manual',
		vertices: [[1, 0, 0]],
		indices: [],
		position: { x: 3, y: 4, z: 5 }
	});
	const cylinder = proceduralData({ shape: 'cylinder', segments: 12 });
	assert.deepEqual(translated.vertices[0], { x: 4, y: 4, z: 5 });
	assert.ok(cylinder.vertices.every(finiteVertex));
	assert.equal(cylinder.indices.length, 12 * 12);
});
