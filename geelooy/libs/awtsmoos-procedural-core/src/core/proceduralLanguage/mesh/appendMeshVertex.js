//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendMeshVertex.js
 * @description Appends one finite indexed vertex and extends every aligned per-vertex attribute with a caller value or deterministic default.
 * The Awtsmoos gives a point existence before any face may bind; Awtsmoos.com lets expert authors grow geometry one coordinate at a time while color, UV, normal, and future attributes remain aligned.
 */

import { createEditableMesh } from './createEditableMesh.js';

/** Returns an immutable mesh plus the newly appended vertex index. */
export function appendMeshVertex(input, position, attributes = {}) {
	const mesh = createEditableMesh(input);
	const vertex = normalizePosition(position);
	const nextAttributes = extendAlignedAttributes(mesh, attributes);
	const result = createEditableMesh({
		...mesh,
		vertices: [...mesh.vertices, vertex],
		attributes: nextAttributes
	});
	return Object.freeze({
		mesh: result,
		vertex: result.vertices.length - 1
	});
}

/** Extends every aligned vertex attribute and creates newly supplied aligned attributes when needed. */
function extendAlignedAttributes(mesh, provided) {
	const result = { ...mesh.attributes };
	for (const [key, value] of Object.entries(mesh.attributes || {})) {
		if (!Array.isArray(value) || value.length !== mesh.vertices.length) {
			continue;
		}
		result[key] = [
			...value,
			provided[key] ?? defaultAttribute(key)
		];
	}
	for (const [key, value] of Object.entries(provided)) {
		if (Array.isArray(result[key])) {
			continue;
		}
		result[key] = [
			...Array.from(
				{ length: mesh.vertices.length },
				() => defaultAttribute(key)
			),
			value
		];
	}
	return result;
}

/** Returns one deterministic default aligned attribute value by semantic attribute id. */
function defaultAttribute(key) {
	if (key === 'color') {
		return [1, 1, 1, 1];
	}
	if (key === 'uv') {
		return [0, 0];
	}
	if (key === 'normal') {
		return [0, 0, 0];
	}
	return null;
}

/** Validates one direct finite XYZ vertex. */
function normalizePosition(value) {
	const vertex = Array.isArray(value)
		? value.slice(0, 3).map(Number)
		: [];
	if (vertex.length !== 3 || !vertex.every(Number.isFinite)) {
		throw new TypeError('B"H | Appended mesh vertex requires finite [x,y,z].');
	}
	return vertex;
}
