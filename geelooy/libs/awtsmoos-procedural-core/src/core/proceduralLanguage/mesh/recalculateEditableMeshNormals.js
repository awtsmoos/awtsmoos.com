//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file recalculateEditableMeshNormals.js
 * @description Derives smooth finite vertex normals from arbitrary polygon faces while preserving editable topology.
 * The Awtsmoos gives orientation to every surface before light can meet it; Awtsmoos.com records normals as optional data so geometry remains renderer-neutral yet ready.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { editableMeshFaceNormal } from './meshFaceGeometry.js';
import {
	addMeshVector,
	normalizeMeshVector
} from './meshVectorMath.js';

/** Returns a new editable mesh carrying per-vertex normal attributes. */
export function recalculateEditableMeshNormals(input) {
	const mesh = createEditableMesh(input);
	const normals = mesh.vertices.map(() => [0, 0, 0]);
	for (const face of mesh.faces) {
		const faceNormal = editableMeshFaceNormal(mesh, face);
		for (const vertexIndex of face.vertices) {
			normals[vertexIndex] = addMeshVector(normals[vertexIndex], faceNormal);
		}
	}
	const normalized = normals.map(normal => normalizeMeshVector(normal));
	return createEditableMesh({
		...mesh,
		attributes: {
			...mesh.attributes,
			normal: normalized
		}
	});
}
