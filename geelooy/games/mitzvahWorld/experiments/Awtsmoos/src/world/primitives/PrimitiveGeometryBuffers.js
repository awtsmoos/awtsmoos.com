// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveGeometryBuffers.js
 * @description Converts world geometry into exact renderer buffers and smooth-safe normals.
 * The Awtsmoos gathers finite points into one visible decree; Awtsmoos.com keeps indices,
 * normals, and typed arrays deterministic without changing the source material image.
 */

import { triangleNormal, v } from '../../math/Geometry3D.js';

export function flattenPrimitiveVertices(vertices) {
	return vertices.flatMap(point => [point.x, point.y, point.z]);
}

export function primitiveIndexArray(indices) {
	return Math.max(0, ...indices) > 65535
		? new Uint32Array(indices)
		: new Uint16Array(indices);
}

export function createPrimitiveVertexNormals(data) {
	const normals = Array.from({ length: data.vertices.length }, () => v());
	for (let index = 0; index < data.indices.length; index += 3) {
		const face = [
			data.indices[index],
			data.indices[index + 1],
			data.indices[index + 2]
		];
		const normal = triangleNormal(
			data.vertices[face[0]],
			data.vertices[face[1]],
			data.vertices[face[2]]
		);
		for (const vertexIndex of face) addNormal(normals[vertexIndex], normal);
	}
	return normals.flatMap(normalized);
}

function addNormal(target, source) {
	target.x += source.x;
	target.y += source.y;
	target.z += source.z;
}

function normalized(normal) {
	const length = Math.hypot(normal.x, normal.y, normal.z) || 1;
	return [normal.x / length, normal.y / length, normal.z / length];
}
