// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file authoredSurfaceNormalPipeline.test.mjs
 * @description Proves authored normals rotate and survive into renderer vertex arrays.
 * The Awtsmoos carries local direction into world-facing light without translation;
 * Awtsmoos.com keeps the truthful normal intact through mesh, bridge, and buffer creation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { proceduralData } from '../../world/ProceduralBridge.js';
import {
	createPrimitiveVertexNormals
} from '../../world/primitives/PrimitiveGeometryBuffers.js';

test('authored manual normals rotate and reach renderer buffers', () => {
	const data = proceduralData({
		faces: [[0, 1, 2]],
		normals: [[1, 0, 0], [1, 0, 0], [1, 0, 0]],
		rotation: { x: 0, y: Math.PI / 2, z: 0 },
		shape: 'manual',
		vertices: [[0, 0, 0], [0, 1, 0], [0, 0, 1]]
	});
	const normals = createPrimitiveVertexNormals(data);
	assert.equal(data.normals.length, 3);
	for (let index = 0; index < normals.length; index += 3) {
		assert.ok(Math.abs(normals[index]) < 1e-9);
		assert.ok(Math.abs(normals[index + 1]) < 1e-9);
		assert.ok(Math.abs(normals[index + 2] - 1) < 1e-9);
	}
});

test('missing authored normals retain computed fallback', () => {
	const data = proceduralData({
		faces: [[0, 1, 2]],
		shape: 'manual',
		vertices: [[0, 0, 0], [1, 0, 0], [0, 0, 1]]
	});
	const normals = createPrimitiveVertexNormals(data);
	assert.equal(normals.length, 9);
	assert.ok(normals.every(Number.isFinite));
	assert.ok(normals.some(value => Math.abs(value) > 0.9));
});
