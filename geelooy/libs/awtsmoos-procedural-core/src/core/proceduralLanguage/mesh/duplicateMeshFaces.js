//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file duplicateMeshFaces.js
 * @description Duplicates selected faces and their required vertices inside the same mesh, preserving materials and aligned vertex attributes while optionally translating the copy.
 * The Awtsmoos gives one form two finite revelations while Awtsmoos.com lets a panel, blade, bogie detail, window bank, or hull plate duplicate without becoming a separate scene vessel.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { appendMeshVertexAttributes } from './copyMeshVertexAttributes.js';
import { resolveMeshSelection } from './meshSelection.js';

/** Returns the same indexed mesh with a detached duplicate of selected faces appended. */
export function duplicateMeshFaces(input, selection = 'all', options = {}) {
	const mesh = createEditableMesh(input);
	const faceIndices = resolveMeshSelection(mesh, 'faces', selection);
	const sourceVertices = usedVertices(mesh, faceIndices);
	const offset = normalizeOffset(options.offset || [0, 0, 0]);
	const vertices = mesh.vertices.map(vertex => [...vertex]);
	const remap = new Map();
	for (const sourceIndex of sourceVertices) {
		const source = mesh.vertices[sourceIndex];
		vertices.push(source.map((value, axis) => value + offset[axis]));
		remap.set(sourceIndex, vertices.length - 1);
	}
	const faces = faceIndices.map(faceIndex => {
		const face = mesh.faces[faceIndex];
		return {
			...face,
			id: `${face.id}:duplicate`,
			vertices: face.vertices.map(index => remap.get(index)),
			metadata: {
				...face.metadata,
				generatedBy: 'duplicate'
			}
		};
	});
	const attributes = appendMeshVertexAttributes(
		mesh.attributes,
		sourceVertices,
		{ vertexCount: mesh.vertices.length }
	);
	return createEditableMesh({
		...mesh,
		vertices,
		faces: [...mesh.faces, ...faces],
		attributes,
		selections: {
			vertices: mesh.selections.vertices,
			edges: {},
			faces: {}
		}
	});
}

/** Returns deterministic source vertices used by one selected face set. */
function usedVertices(mesh, faceIndices) {
	const values = new Set();
	for (const faceIndex of faceIndices) {
		for (const vertexIndex of mesh.faces[faceIndex].vertices) {
			values.add(vertexIndex);
		}
	}
	return [...values].sort((left, right) => left - right);
}

/** Validates one finite translation offset for the duplicate. */
function normalizeOffset(value) {
	const offset = Array.isArray(value)
		? value.slice(0, 3).map(Number)
		: [];
	if (offset.length !== 3 || !offset.every(Number.isFinite)) {
		throw new TypeError('B"H | Mesh duplicate offset requires finite [x,y,z].');
	}
	return offset;
}
