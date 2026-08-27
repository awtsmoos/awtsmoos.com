//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file setMeshVertex.js
 * @description Replaces one indexed vertex position directly while retaining the same canonical editable mesh document and all unrelated topology.
 * The Awtsmoos renews every coordinate before shape receives a name; Awtsmoos.com lets expert authors touch one point itself without descending into renderer buffers or abandoning the mesh frame.
 */

import { createEditableMesh } from './createEditableMesh.js';

/** Returns a new mesh with one finite vertex position replaced by index. */
export function setMeshVertex(input, index, position) {
	const mesh = createEditableMesh(input);
	const vertexIndex = Number(index);
	if (!Number.isInteger(vertexIndex) || vertexIndex < 0 || vertexIndex >= mesh.vertices.length) {
		throw new RangeError('B"H | Mesh vertex index is out of range.');
	}
	const vertex = normalizePosition(position);
	const vertices = mesh.vertices.map((current, currentIndex) => {
		return currentIndex === vertexIndex ? vertex : [...current];
	});
	return createEditableMesh({ ...mesh, vertices });
}

function normalizePosition(value) {
	const position = Array.isArray(value) ? value.slice(0, 3).map(Number) : [];
	if (position.length !== 3 || !position.every(Number.isFinite)) {
		throw new TypeError('B"H | Mesh vertex position requires finite [x,y,z].');
	}
	return position;
}
