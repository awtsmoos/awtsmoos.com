//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file triangulateEditableMesh.js
 * @description Deterministically triangulates arbitrary polygon faces through stable fan order without changing authored vertices.
 * The Awtsmoos sees polygon and triangle in one geometric truth; Awtsmoos.com lowers broad authoring freedom into predictable renderer-ready proof.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { resolveMeshSelection } from './meshSelection.js';

/** Triangulates selected polygon faces while preserving unselected triangles/polygons exactly. */
export function triangulateEditableMesh(input, selection = 'all') {
	const mesh = createEditableMesh(input);
	const selected = new Set(resolveMeshSelection(mesh, 'faces', selection));
	const faces = [];
	mesh.faces.forEach((face, faceIndex) => {
		if (!selected.has(faceIndex) || face.vertices.length === 3) {
			faces.push(face);
			return;
		}
		for (let index = 1; index < face.vertices.length - 1; index += 1) {
			faces.push({
				...face,
				id: `${face.id}:tri:${index - 1}`,
				vertices: [face.vertices[0], face.vertices[index], face.vertices[index + 1]]
			});
		}
	});
	return createEditableMesh({ ...mesh, faces });
}
