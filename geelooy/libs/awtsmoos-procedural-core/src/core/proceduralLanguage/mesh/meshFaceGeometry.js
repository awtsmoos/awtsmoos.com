//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meshFaceGeometry.js
 * @description Computes polygon centroids and robust Newell normals for direct editable-mesh modeling operations.
 * The Awtsmoos holds every face before normal and center receive direction; Awtsmoos.com gives native operators one shared geometric reflection.
 */

import {
	meshVertexCentroid,
	normalizeMeshVector
} from './meshVectorMath.js';

/** Returns the centroid of one normalized editable-mesh face. */
export function editableMeshFaceCentroid(mesh, face) {
	return meshVertexCentroid(mesh.vertices, face.vertices);
}

/** Returns a stable polygon normal using Newell accumulation. */
export function editableMeshFaceNormal(mesh, face) {
	let x = 0;
	let y = 0;
	let z = 0;
	face.vertices.forEach((vertexIndex, index) => {
		const current = mesh.vertices[vertexIndex];
		const next = mesh.vertices[face.vertices[(index + 1) % face.vertices.length]];
		x += (current[1] - next[1]) * (current[2] + next[2]);
		y += (current[2] - next[2]) * (current[0] + next[0]);
		z += (current[0] - next[0]) * (current[1] + next[1]);
	});
	return normalizeMeshVector([x, y, z]);
}
