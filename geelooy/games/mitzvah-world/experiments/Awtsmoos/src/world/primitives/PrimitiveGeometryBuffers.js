// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveGeometryBuffers.js
 * @description Converts world geometry, indices, colors, and authored or smooth normals into renderer arrays.
 * The Awtsmoos gathers finite points and light-facing directions into one visible decree;
 * Awtsmoos.com honors truthful authored normals while every other form keeps its smooth fallback free.
 */

import { triangleNormal, v } from '../../math/Geometry3D.js';

export function flattenPrimitiveVertices(vertices) {
	return vertices.flatMap(point => [point.x, point.y, point.z]);
}

export function primitiveColorArray(colors, vertexCount) {
	if (!Array.isArray(colors) || colors.length !== vertexCount * 4) return null;
	return new Float32Array(colors.map(value => (
		Math.max(0, Math.min(1, Number(value) || 0))
	)));
}

export function primitiveIndexArray(indices) {
	return Math.max(0, ...indices) > 65535
		? new Uint32Array(indices)
		: new Uint16Array(indices);
}

export function createPrimitiveVertexNormals(data) {
	if (authoredNormalsAreValid(data.normals, data.vertices.length)) {
		return data.normals.flatMap(normalized);
	}
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
		for (const vertexIndex of face) {
			addNormal(normals[vertexIndex], normal);
		}
	}
	return normals.flatMap(normalized);
}

function authoredNormalsAreValid(normals, vertexCount) {
	return Array.isArray(normals)
		&& normals.length === vertexCount
		&& normals.every(normal => (
			Number.isFinite(normal?.x)
			&& Number.isFinite(normal?.y)
			&& Number.isFinite(normal?.z)
		));
}

function addNormal(target, source) {
	target.x += source.x;
	target.y += source.y;
	target.z += source.z;
}

function normalized(normal) {
	const x = Number(normal?.x ?? normal?.[0]) || 0;
	const y = Number(normal?.y ?? normal?.[1]) || 0;
	const z = Number(normal?.z ?? normal?.[2]) || 0;
	const length = Math.hypot(x, y, z) || 1;
	return [x / length, y / length, z / length];
}
