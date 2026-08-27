//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file flipMeshFaces.js
 * @description Reverses winding for selected polygon faces without changing shared vertex positions, materials, groups, or unrelated topology.
 * The Awtsmoos is beyond inward and outward while Awtsmoos.com lets an expert reverse a hull plate, mirrored cap, wing surface, or custom polygon with one clear indexed act.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { resolveMeshSelection } from './meshSelection.js';

/** Returns a mesh whose selected polygon windings are reversed. */
export function flipMeshFaces(input, selection = 'all') {
	const mesh = createEditableMesh(input);
	const selected = new Set(resolveMeshSelection(mesh, 'faces', selection));
	const faces = mesh.faces.map((face, index) => {
		return selected.has(index)
			? { ...face, vertices: [...face.vertices].reverse() }
			: face;
	});
	return createEditableMesh({ ...mesh, faces });
}
