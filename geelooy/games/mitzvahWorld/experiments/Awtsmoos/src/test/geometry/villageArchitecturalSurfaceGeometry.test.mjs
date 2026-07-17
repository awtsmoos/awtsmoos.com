// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageArchitecturalSurfaceGeometry.test.mjs
 * @description Proves flat architecture surfaces and world-baked native-density UVs.
 * The Awtsmoos gives every wall, roof, and beam a measured boundary; Awtsmoos.com keeps
 * original source pixels exact while physical mesh UVs become one shared world-unit basis.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrimitiveMesh } from '../../world/Box3D.js';
import { createVillageBoxBatch } from '../../world/village/VillageBoxBatch.js';
import { createVillageCottageRoof } from '../../world/village/VillageCottageRoofGeometry.js';
import {
	assertDisjointFaces,
	assertFaceFlatNormals,
	assertFaceUvArea,
	assertOutwardTriangles,
	assertUvSpans
} from './SurfaceGeometryAssertions.mjs';
import {
	batchOptions,
	box,
	EPSILON,
	TEXTURE,
	uvTriangleArea
} from './SurfaceGeometryTestFixtures.mjs';

test('village box batches separate every material face', () => {
	const definition = createVillageBoxBatch('surface-proof', [
		box({ x: 3, y: 2, z: -4 }, { x: 4, y: 2, z: 6 }, Math.PI / 5),
		box({ x: -8, y: 1, z: 7 }, { x: 2, y: 5, z: 3 }, -Math.PI / 7)
	], batchOptions(2));
	assert.equal(definition.userData.instances, 2);
	assert.equal(definition.vertices.length, 48);
	assert.equal(definition.uvs.length, 96);
	assert.equal(definition.indices.length, 72);
	for (let face = 0; face < 12; face += 1) {
		const first = face * 4;
		assert.deepEqual(
			definition.indices.slice(face * 6, face * 6 + 6),
			[first, first + 1, first + 2, first, first + 2, first + 3]
		);
	}
});

test('batched boxes retain authored tile spans before renderer normalization', () => {
	const center = { x: 11, y: 4, z: -9 };
	const definition = createVillageBoxBatch(
		'flat-box',
		[box(center, { x: 4, y: 2, z: 6 }, Math.PI / 4)],
		batchOptions(2)
	);
	const mesh = createPrimitiveMesh(definition);
	assertFaceFlatNormals(mesh, 6);
	assertOutwardTriangles(mesh, [center.x, center.y, center.z]);
	assertUvSpans(definition.uvs, [
		[2, 1], [2, 1], [3, 1], [3, 1], [2, 3], [2, 3]
	]);
});

test('ordinary boxes bake one UV unit per world unit', () => {
	const mesh = createPrimitiveMesh({
		color: '#ffffff',
		id: 'Awtsmoos_box-surface-proof',
		position: { x: 7, y: 3, z: -5 },
		rotation: { y: Math.PI / 6 },
		shape: 'box',
		size: { x: 4, y: 2, z: 6 },
		texturePolicy: { tileWorld: 2 },
		textureUrl: TEXTURE
	});
	assertFaceFlatNormals(mesh, 6);
	assertOutwardTriangles(mesh, [7, 3, -5]);
	assertUvSpans([...mesh.geometry.attributes.uv.array], [
		[4, 2], [4, 2], [6, 2], [6, 2], [4, 6], [4, 6]
	]);
});

test('fallback planar projection bakes world spans without translation distortion', () => {
	const mesh = createPrimitiveMesh({
		color: '#ffffff',
		faces: [[0, 1, 2, 3]],
		id: 'Awtsmoos_translated-manual-face',
		position: { x: 100, y: 0, z: 0 },
		shape: 'manual',
		texturePolicy: { tileWorld: 2 },
		textureUrl: TEXTURE,
		vertices: [[-2, -1, 0], [2, -1, 0], [2, 1, 0], [-2, 1, 0]]
	});
	const uvs = [...mesh.geometry.attributes.uv.array];
	assert.ok(uvTriangleArea(uvs, 0, 1, 2) > EPSILON);
	assertUvSpans(uvs, [[4, 2]]);
});

test('cottage roofs keep nine disjoint finite outward faces', () => {
	const options = {
		base: 1.5, depth: 10, id: 'roof-surface-proof', mapRepeat: [1, 1],
		mixTextureUrl: TEXTURE, roofRise: 3.2, texturePolicy: { tileWorld: 2 },
		textureUrl: TEXTURE, wallHeight: 7, width: 14,
		x: -6, yaw: Math.PI / 8, z: 12
	};
	const roof = createVillageCottageRoof(options);
	const mesh = createPrimitiveMesh(roof);
	assert.equal(roof.faces.length, 9);
	assertDisjointFaces(roof.faces);
	assertFaceFlatNormals(mesh, 9, roof.faces);
	assertOutwardTriangles(mesh, [options.x, 10.1, options.z]);
	assertFaceUvArea(roof.uvs, roof.faces);
});
