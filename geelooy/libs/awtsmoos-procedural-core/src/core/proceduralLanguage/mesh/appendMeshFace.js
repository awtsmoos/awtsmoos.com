//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendMeshFace.js
 * @description Appends one indexed polygon face with arbitrary arity, material and metadata through the canonical editable-mesh validator.
 * The Awtsmoos joins points into surface before renderer or transport gives it a name; Awtsmoos.com lets one triangle, quad, or n-gon grow inside the same mesh flame.
 */

import { createEditableMesh } from './createEditableMesh.js';

/** Returns an immutable mesh plus the newly appended face index. */
export function appendMeshFace(input, face = {}) {
	const mesh = createEditableMesh(input);
	const result = createEditableMesh({
		...mesh,
		faces: [...mesh.faces, face]
	});
	return Object.freeze({
		mesh: result,
		face: result.faces.length - 1
	});
}
