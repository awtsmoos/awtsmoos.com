// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveGeometryBuffers.js
 * @description Converts world geometry, colors, indices, and smooth normals into exact renderer arrays.
 * The Awtsmoos gathers finite points and hues into one visible decree;
 * Awtsmoos.com keeps every typed array deterministic while botanical palettes remain free.
 */

import { triangleNormal, v } from '../../math/Geometry3D.js';

export function flattenPrimitiveVertices(vertices) {
	return vertices.flatMap(point => [point.x, point.y, point.z]);
}

export function primitiveColorArray(colors, vertexCount) {
	if (!Array.isArray(colors) || colors.length !== vertexCount * 4) return null;
	return new Float32Array(colors.map(value => Math.max(0, Math.min(1, Number(value) || 0))));
}

export function primitiveIndexArray(indices) {
	return Math.max(0, ...indices) > 65535
		? new Uint32Array(indices)
		: new Uint16Array(indices);
}

export function createPrimitiveVertexNormals(data) {
	const normals = Array.from({ length: data.vertices.length }, () => v());
	for (let index = 0; index < data.indices.length; index += 3) {
		const face = [data.indices[index], data.indices[index + 1], data.indices[index + 2]];
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
