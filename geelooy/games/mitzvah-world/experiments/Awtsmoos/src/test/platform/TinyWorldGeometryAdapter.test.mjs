// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { createTinyWorldMesh } from '../../world/platform/TinyWorldGeometryAdapter.js';

test('packs indexed positions, normals, UVs, colors, and material texture metadata', () => {
	const mesh = createTinyWorldMesh({
		colors: [[1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1]],
		faces: [[0, 1, 2]],
		role: 'test-triangle',
		uvs: [[0, 0], [1, 0], [0, 1]],
		vertices: [[0, 0, 0], [1, 0, 0], [0, 1, 0]]
	}, {
		color: '#ffffff',
		textureUrl: 'https://example.invalid/texture.png'
	});
	assert.equal(mesh.geometry.attributes.position.count, 3);
	assert.equal(mesh.geometry.attributes.normal.count, 3);
	assert.equal(mesh.geometry.attributes.uv.count, 3);
	assert.equal(mesh.geometry.attributes.color.count, 3);
	assert.deepEqual([...mesh.geometry.index.array], [0, 1, 2]);
	assert.equal(mesh.material.textureUrl, 'https://example.invalid/texture.png');
	assert.equal(mesh.userData.role, 'test-triangle');
});
