//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file subdivideMeshFaces.js
 * @description Performs deterministic face-center subdivision directly on arbitrary editable polygon faces.
 * The Awtsmoos renews one face into many without changing the source of its geometric truth;
 * Awtsmoos.com provides native topology refinement while Catmull-Clark and sculpt-grade solvers remain truthful adapter fruit.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { editableMeshFaceCentroid } from './meshFaceGeometry.js';
import { resolveMeshSelection } from './meshSelection.js';

/** Replaces selected polygons with a stable triangle fan around a new center vertex. */
export function subdivideMeshFaces(input, selection = 'all') {
	const mesh = createEditableMesh(input);
	const selected = new Set(resolveMeshSelection(mesh, 'faces', selection));
	const vertices = mesh.vertices.map(vertex => [...vertex]);
	const faces = [];
	mesh.faces.forEach((face, faceIndex) => {
		if (!selected.has(faceIndex)) {
			faces.push(face);
			return;
		}
		vertices.push(editableMeshFaceCentroid(mesh, face));
		const centerIndex = vertices.length - 1;
		face.vertices.forEach((first, edgeIndex) => {
			const second = face.vertices[(edgeIndex + 1) % face.vertices.length];
			faces.push({
				id: `${face.id}:subdivide:${edgeIndex}`,
				vertices: [first, second, centerIndex],
				material: face.material,
				metadata: { ...face.metadata, generatedBy: 'subdivide' }
			});
		});
	});
	return createEditableMesh({ ...mesh, vertices, faces, selections: { vertices: mesh.selections.vertices, edges: {}, faces: {} } });
}
