// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurfaceGeometryAssertions.mjs
 * @description Verifies flat normals, outward winding, disjoint faces, and finite UV area.
 * The Awtsmoos reveals every boundary with direction and measure; Awtsmoos.com keeps
 * architectural geometry assertions focused while production code remains free of test detail.
 */

import assert from 'node:assert/strict';
import {
	cross,
	distance,
	dot,
	EPSILON,
	length,
	subtract,
	triangulate,
	uvTriangleArea,
	vectorAt
} from './SurfaceGeometryTestFixtures.mjs';

export function assertFaceFlatNormals(mesh, expectedFaces, faces = null) {
	const normals = mesh.geometry.attributes.normal.array;
	const groups = faces || Array.from({ length: expectedFaces }, (_value, index) => (
		[index * 4, index * 4 + 1, index * 4 + 2, index * 4 + 3]
	));
	assert.equal(groups.length, expectedFaces);
	for (const face of groups) {
		const first = vectorAt(normals, face[0]);
		assert.ok(Math.abs(length(first) - 1) < EPSILON);
		for (const index of face.slice(1)) {
			assert.ok(distance(first, vectorAt(normals, index)) < EPSILON);
		}
	}
}

export function assertOutwardTriangles(mesh, interior) {
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

export function assertUvSpans(uvs, expected) {
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
		assert.ok(Math.abs(uvTriangleArea(
			uvs,
			face * 4,
			face * 4 + 1,
			face * 4 + 2
		)) > EPSILON);
	}
}

export function assertDisjointFaces(faces) {
	const seen = new Set();
	for (const face of faces) {
		for (const index of face) {
			assert.equal(seen.has(index), false);
			seen.add(index);
		}
	}
}

export function assertFaceUvArea(uvs, faces) {
	for (const face of faces) {
		for (const [a, b, c] of triangulate(face)) {
			assert.ok(Math.abs(uvTriangleArea(uvs, a, b, c)) > EPSILON);
		}
	}
}
