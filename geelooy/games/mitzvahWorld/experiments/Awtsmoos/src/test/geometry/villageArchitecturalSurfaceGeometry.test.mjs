// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageArchitecturalSurfaceGeometry.test.mjs
 * @description Proves batched boxes and cottage roofs retain flat, outward surfaces
 * with finite world-scale UVs instead of sharing corner normals or position-selected maps.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrimitiveMesh } from '../../world/Box3D.js';
import { createVillageBoxBatch } from '../../world/village/VillageBoxBatch.js';
import { createVillageCottageRoof } from '../../world/village/VillageCottageRoofGeometry.js';

const TEXTURE = 'data:image/png;base64,AA==';
const EPSILON = 1e-6;

test('village box batches keep one definition while separating every material face', () => {
	const definition = createVillageBoxBatch('surface-proof', [
		box({ x: 3, y: 2, z: -4 }, { x: 4, y: 2, z: 6 }, Math.PI / 5),
		box({ x: -8, y: 1, z: 7 }, { x: 2, y: 5, z: 3 }, -Math.PI / 7)
	], batchOptions(2));
	assert.equal(definition.userData.instances, 2);
	assert.equal(definition.vertices.length, 48);
	assert.equal(definition.uvs.length, 96);
	assert.equal(definition.indices.length, 72);
	assert.ok(definition.vertices.flat().every(Number.isFinite));
	assert.ok(definition.uvs.every(Number.isFinite));
	for (let face = 0; face < 12; face += 1) {
		const first = face * 4;
		assert.deepEqual(
			definition.indices.slice(face * 6, face * 6 + 6),
			[first, first + 1, first + 2, first, first + 2, first + 3]
		);
	}
});

test('batched boxes expose flat unit normals, outward winding, and dimension-scaled UVs', () => {
	const center = { x: 11, y: 4, z: -9 };
	const definition = createVillageBoxBatch(
		'flat-box',
		[box(center, { x: 4, y: 2, z: 6 }, Math.PI / 4)],
		batchOptions(2)
	);
	const mesh = createPrimitiveMesh(definition);
	assert.equal(mesh.geometry.attributes.position.count, 24);
	assertFaceFlatNormals(mesh, 6);
	assertOutwardTriangles(mesh, [center.x, center.y, center.z]);
	assertUvSpans(definition.uvs, [
		[2, 1], [2, 1], [3, 1], [3, 1], [2, 3], [2, 3]
	]);
});

test('ordinary Box3D cubes already use face-separated flat geometry', () => {
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
	assert.equal(mesh.geometry.attributes.position.count, 24);
	assertFaceFlatNormals(mesh, 6);
	assertOutwardTriangles(mesh, [7, 3, -5]);
	assertUvSpans([...mesh.geometry.attributes.uv.array], [
		[2, 1], [2, 1], [3, 1], [3, 1], [2, 3], [2, 3]
	]);
});

test('fallback planar UV projection follows surface normals instead of world position', () => {
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
	assertUvSpans(uvs, [[2, 1]]);
});

test('cottage roofs separate all nine faces with finite UVs and outward winding', () => {
	const options = {
		base: 1.5,
		depth: 10,
		id: 'roof-surface-proof',
		mapRepeat: [1, 1],
		mixTextureUrl: TEXTURE,
		roofRise: 3.2,
		texturePolicy: { tileWorld: 2 },
		textureUrl: TEXTURE,
		wallHeight: 7,
		width: 14,
		x: -6,
		yaw: Math.PI / 8,
		z: 12
	};
	const roof = createVillageCottageRoof(options);
	assert.equal(roof.faces.length, 9);
	assert.equal(roof.vertices.length, 34);
	assert.equal(roof.uvs.length, 68);
	assert.ok(roof.vertices.flat().every(Number.isFinite));
	assert.ok(roof.uvs.every(Number.isFinite));
	assertDisjointFaces(roof.faces);
	const mesh = createPrimitiveMesh(roof);
	assertFaceFlatNormals(mesh, 9, roof.faces);
	assertOutwardTriangles(mesh, [
		options.x,
		options.base + options.wallHeight + options.roofRise / 4,
		options.z
	]);
	for (const face of roof.faces) {
		const triangles = triangulate(face);
		for (const [a, b, c] of triangles) {
			assert.ok(Math.abs(uvTriangleArea(roof.uvs, a, b, c)) > EPSILON);
		}
	}
});

function box(position, size, yaw) {
	return { position, size, yaw };
}

function batchOptions(tileWorld) {
	return {
		color: '#ffffff',
		family: 'geometry-test',
		part: 'box',
		texturePolicy: { tileWorld },
		textureUrl: TEXTURE
	};
}

function assertFaceFlatNormals(mesh, expectedFaces, faces = null) {
	const normals = mesh.geometry.attributes.normal.array;
	const groups = faces || Array.from({ length: expectedFaces }, (_value, index) => (
		[index * 4, index * 4 + 1, index * 4 + 2, index * 4 + 3]
	));
	assert.equal(groups.length, expectedFaces);
	for (const face of groups) {
		const first = vectorAt(normals, face[0]);
		assert.ok(Math.abs(length(first) - 1) < EPSILON);
		for (const index of face.slice(1)) {
			const normal = vectorAt(normals, index);
			assert.ok(distance(first, normal) < EPSILON);
		}
	}
}

function assertOutwardTriangles(mesh, interior) {
	const positions = mesh.geometry.attributes.position.array;
	const indices = mesh.geometry.index.array;
	for (let offset = 0; offset < indices.length; offset += 3) {
		const a = vectorAt(positions, indices[offset]);
		const b = vectorAt(positions, indices[offset + 1]);
		const c = vectorAt(positions, indices[offset + 2]);
		const normal = cross(subtract(b, a), subtract(c, a));
		const centroid = a.map((value, index) => (
			(value + b[index] + c[index]) / 3
		));
		assert.ok(dot(normal, subtract(centroid, interior)) > EPSILON);
	}
}

function assertUvSpans(uvs, expected) {
	for (let face = 0; face < expected.length; face += 1) {
		const points = Array.from({ length: 4 }, (_value, index) => {
			const offset = (face * 4 + index) * 2;
			return [uvs[offset], uvs[offset + 1]];
		});
		const span = [
			Math.max(...points.map(([u]) => u)) - Math.min(...points.map(([u]) => u)),
			Math.max(...points.map(([, v]) => v)) - Math.min(...points.map(([, v]) => v))
		];
		assert.ok(Math.abs(span[0] - expected[face][0]) < EPSILON);
		assert.ok(Math.abs(span[1] - expected[face][1]) < EPSILON);
		assert.ok(Math.abs(uvTriangleArea(uvs, face * 4, face * 4 + 1, face * 4 + 2)) > EPSILON);
	}
}

function assertDisjointFaces(faces) {
	const seen = new Set();
	for (const face of faces) {
		for (const index of face) {
			assert.equal(seen.has(index), false);
			seen.add(index);
		}
	}
}

function triangulate(face) {
	const triangles = [];
	for (let index = 1; index < face.length - 1; index += 1) {
		triangles.push([face[0], face[index], face[index + 1]]);
	}
	return triangles;
}

function uvTriangleArea(uvs, a, b, c) {
	const point = (index) => [uvs[index * 2], uvs[index * 2 + 1]];
	const [ua, ub, uc] = [point(a), point(b), point(c)];
	return (
		(ub[0] - ua[0]) * (uc[1] - ua[1])
		- (ub[1] - ua[1]) * (uc[0] - ua[0])
	) / 2;
}

function vectorAt(values, index) {
	const offset = index * 3;
	return [values[offset], values[offset + 1], values[offset + 2]];
}

function subtract(left, right) {
	return left.map((value, index) => value - right[index]);
}

function cross(left, right) {
	return [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
}

function dot(left, right) {
	return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

function length(value) {
	return Math.hypot(...value);
}

function distance(left, right) {
	return length(subtract(left, right));
}
