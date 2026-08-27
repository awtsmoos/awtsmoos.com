//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file deleteMeshSelection.js
 * @description Deletes selected faces or vertices and deterministically remaps surviving polygon indices.
 * The Awtsmoos renews presence and absence alike while Awtsmoos.com makes topology deletion explicit instead of hiding destructive mutation in place.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { resolveMeshSelection } from './meshSelection.js';

/** Deletes faces or vertices and returns a compact immutable mesh. */
export function deleteMeshSelection(input, domain, selection) {
	const mesh = createEditableMesh(input);
	if (domain === 'faces') {
		const removed = new Set(resolveMeshSelection(mesh, 'faces', selection));
		return createEditableMesh({
			...mesh,
			faces: mesh.faces.filter((face, index) => !removed.has(index)),
			selections: { vertices: mesh.selections.vertices, edges: {}, faces: {} }
		});
	}
	if (domain !== 'vertices') {
		throw new TypeError('B"H | deleteMeshSelection supports vertices or faces.');
	}
	const removed = new Set(resolveMeshSelection(mesh, 'vertices', selection));
	const remap = new Map();
	const vertices = [];
	mesh.vertices.forEach((vertex, index) => {
		if (removed.has(index)) return;
		remap.set(index, vertices.length);
		vertices.push(vertex);
	});
	const faces = mesh.faces
		.filter(face => face.vertices.every(index => !removed.has(index)))
		.map(face => ({ ...face, vertices: face.vertices.map(index => remap.get(index)) }));
	return createEditableMesh({ ...mesh, vertices, faces, selections: { vertices: {}, edges: {}, faces: {} } });
}
