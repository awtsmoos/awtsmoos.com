// B"H
// Boruch Hashem
// Blessed is He

/** @file roadJunctionWinding.test.mjs @description Keeps road caps visible under backface culling. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { appendRoadJunctions } from '../../world/road/RoadJunctionGeometry.js';
import { createRoadMesh } from '../../world/road/RoadMeshWriter.js';

test('junction top caps wind upward and bottom caps wind downward', () => {
	const mesh = createRoadMesh(1);
	appendRoadJunctions(
		mesh,
		[{ points: [{ x: 0, z: 0 }, { x: 0, z: 0 }] }],
		{ heightAt() { return { y: 0 }; } },
		4
	);
	assert.equal(mesh.topFaceIndices.length, 18);
	for (const faceIndex of mesh.topFaceIndices) {
		assert.ok(normalY(mesh, mesh.faces[faceIndex]) > 0);
		assert.ok(normalY(mesh, mesh.faces[faceIndex + 1]) < 0);
		assert.ok(radialFaceDot(mesh, mesh.faces[faceIndex + 2]) > 0);
	}
	assert.ok(signedVolume(mesh) > 0);
});

function normalY(mesh, face) {
	const [a, b, c] = face.map(index => mesh.vertices[index]);
	const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
	const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
	return ab[2] * ac[0] - ab[0] * ac[2];
}

function radialFaceDot(mesh, face) {
	const [a, b, c] = face.slice(0, 3).map(index => mesh.vertices[index]);
	const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
	const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
	const normal = [
		ab[1] * ac[2] - ab[2] * ac[1],
		ab[2] * ac[0] - ab[0] * ac[2],
		ab[0] * ac[1] - ab[1] * ac[0]
	];
	const centerX = face.reduce((sum, index) => sum + mesh.vertices[index][0] / face.length, 0);
	const centerZ = face.reduce((sum, index) => sum + mesh.vertices[index][2] / face.length, 0);
	return normal[0] * centerX + normal[2] * centerZ;
}

function signedVolume(mesh) {
	let volume = 0;
	for (const face of mesh.faces) {
		for (let corner = 1; corner < face.length - 1; corner += 1) {
			const a = mesh.vertices[face[0]];
			const b = mesh.vertices[face[corner]];
			const c = mesh.vertices[face[corner + 1]];
			volume += (
				a[0] * (b[1] * c[2] - b[2] * c[1])
				- a[1] * (b[0] * c[2] - b[2] * c[0])
				+ a[2] * (b[0] * c[1] - b[1] * c[0])
			) / 6;
		}
	}
	return volume;
}
