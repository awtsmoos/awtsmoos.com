//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file weldMeshVertices.js
 * @description Merges vertices within a configurable distance, remaps polygon indices, removes degenerate faces, compacts aligned attributes, and preserves semantic groups.
 * The Awtsmoos is unity before duplicate coordinates disappear; Awtsmoos.com lets mirrored seams, imported parts, joined transport modules, and hand-edited points become one clean indexed topology sphere.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { weldMeshVertexGroups } from './weldMeshVertexGroups.js';

/** Returns a compact mesh after deterministic first-match vertex welding within `distance`. */
export function weldMeshVertices(input, options = {}) {
	const mesh = createEditableMesh(input);
	const distance = normalizeDistance(options.distance ?? 1e-6);
	const map = createWeldMap(mesh.vertices, distance);
	const representatives = representativeIndices(map);
	const compact = new Map(representatives.map((source, index) => [source, index]));
	const vertexMap = new Map();
	for (let index = 0; index < mesh.vertices.length; index += 1) {
		vertexMap.set(index, compact.get(map.get(index)));
	}
	const faceResult = remapFaces(mesh.faces, vertexMap);
	const attributes = compactAlignedAttributes(mesh.attributes, representatives, mesh.vertices.length);
	attributes.groups = weldMeshVertexGroups(
		mesh.attributes?.groups || {},
		vertexMap,
		faceResult.faceMap
	);
	return createEditableMesh({
		...mesh,
		vertices: representatives.map(index => [...mesh.vertices[index]]),
		faces: faceResult.faces,
		attributes,
		selections: { vertices: {}, edges: {}, faces: {} }
	});
}

function createWeldMap(vertices, distance) {
	const map = new Map();
	for (let index = 0; index < vertices.length; index += 1) {
		let representative = index;
		for (let candidate = 0; candidate < index; candidate += 1) {
			if (pointDistance(vertices[index], vertices[candidate]) <= distance) {
				representative = map.get(candidate) ?? candidate;
				break;
			}
		}
		map.set(index, representative);
	}
	return map;
}

function representativeIndices(map) {
	return [...new Set(map.values())].sort((left, right) => left - right);
}

function remapFaces(faces, vertexMap) {
	const result = [];
	const faceMap = new Map();
	faces.forEach((face, sourceIndex) => {
		const vertices = face.vertices.map(index => vertexMap.get(index));
		if (new Set(vertices).size < 3) {
			return;
		}
		faceMap.set(sourceIndex, result.length);
		result.push({ ...face, vertices });
	});
	return { faces: result, faceMap };
}

function compactAlignedAttributes(attributes, representatives, vertexCount) {
	const result = { ...attributes };
	for (const [key, value] of Object.entries(attributes || {})) {
		if (Array.isArray(value) && value.length === vertexCount) {
			result[key] = representatives.map(index => copyValue(value[index]));
		}
	}
	return result;
}

function copyValue(value) {
	if (Array.isArray(value)) {
		return [...value];
	}
	return value && typeof value === 'object' ? { ...value } : value;
}

function pointDistance(left, right) {
	return Math.hypot(...left.map((value, axis) => value - right[axis]));
}

function normalizeDistance(value) {
	const distance = Number(value);
	if (!Number.isFinite(distance) || distance < 0) {
		throw new TypeError('B"H | Mesh weld distance must be finite and non-negative.');
	}
	return distance;
}
