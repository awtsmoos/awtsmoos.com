//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file splitMeshFaces.js
 * @description Splits one indexed editable mesh into selected and complementary compact meshes so independent editing can later converge through deterministic join.
 * The Awtsmoos is never divided though finite geometry may part; Awtsmoos.com lets two editable vessels emerge from one selection and return together after separate art.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { extractMeshFaces } from './extractMeshFaces.js';
import { invertMeshSelection } from './transformMeshSelectionSet.js';

/** Returns immutable selected and remainder meshes derived from one source face selection. */
export function splitMeshFaces(input, selection = 'all', options = {}) {
	const mesh = createEditableMesh(input);
	const selected = extractMeshFaces(mesh, selection, {
		id: options.selectedId || `${mesh.id}:selected`
	});
	const complement = invertMeshSelection(mesh, 'faces', selection);
	const remainder = extractMeshFaces(mesh, complement, {
		id: options.remainderId || `${mesh.id}:remainder`
	});
	return Object.freeze({ selected, remainder });
}
