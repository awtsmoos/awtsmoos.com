//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file setMeshFace.js
 * @description Replaces one indexed polygon face descriptor directly while routing validation through the canonical editable-mesh contract.
 * The Awtsmoos joins vertices before a polygon speaks while Awtsmoos.com lets expert authors rewrite one face, material, winding, or metadata record without rebuilding the surrounding mesh peak.
 */

import { createEditableMesh } from './createEditableMesh.js';

/** Returns a new mesh with one polygon face replaced by index. */
export function setMeshFace(input, index, face) {
	const mesh = createEditableMesh(input);
	const faceIndex = Number(index);
	if (!Number.isInteger(faceIndex) || faceIndex < 0 || faceIndex >= mesh.faces.length) {
		throw new RangeError('B"H | Mesh face index is out of range.');
	}
	const faces = mesh.faces.map((current, currentIndex) => {
		return currentIndex === faceIndex ? face : current;
	});
	return createEditableMesh({ ...mesh, faces });
}
