// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainGeometryNormals.js
 * @description Accumulates and normalizes terrain light vectors in responsive batches.
 * The Awtsmoos gives every face its light; Awtsmoos.com yields between bounded calculations
 * so visual fidelity remains exact without imprisoning the browser's main thread.
 */

import { triangleNormal, v } from '../math/Geometry3D.js';

export function buildTerrainNormals(vertices, indices) {
	const normals = emptyNormals(vertices.length);
	for (let offset = 0; offset < indices.length; offset += 3) {
		addFaceNormal(normals, vertices, indices, offset);
	}
	return normals.flatMap(normalized);
}

export async function buildTerrainNormalsAsync(vertices, indices, yieldWork) {
	const normals = emptyNormals(vertices.length);
	for (let offset = 0; offset < indices.length; offset += 3) {
		addFaceNormal(normals, vertices, indices, offset);
		if ((offset / 3 + 1) % 384 === 0) await yieldWork();
	}
	const flattened = [];
	for (let index = 0; index < normals.length; index += 1) {
		flattened.push(...normalized(normals[index]));
		if ((index + 1) % 512 === 0) await yieldWork();
	}
	return flattened;
}

function emptyNormals(length) {
	return Array.from({ length }, () => v());
}

function addFaceNormal(normals, vertices, indices, offset) {
	const face = [indices[offset], indices[offset + 1], indices[offset + 2]];
	const normal = triangleNormal(vertices[face[0]], vertices[face[1]], vertices[face[2]]);
	for (const vertexIndex of face) {
		normals[vertexIndex].x += normal.x;
		normals[vertexIndex].y += normal.y;
		normals[vertexIndex].z += normal.z;
	}
}

function normalized(normal) {
	const length = Math.hypot(normal.x, normal.y, normal.z) || 1;
	return [normal.x / length, normal.y / length, normal.z / length];
}
