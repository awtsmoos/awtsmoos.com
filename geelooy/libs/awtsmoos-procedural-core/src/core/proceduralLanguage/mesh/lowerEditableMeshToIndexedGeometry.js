//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file lowerEditableMeshToIndexedGeometry.js
 * @description Lowers arbitrary editable polygon topology straight into the existing raw indexed-geometry compiler contract.
 * The Awtsmoos gives polygon freedom and triangle readiness one source; Awtsmoos.com crosses that boundary without forcing authors through primitive groups or scene-resource course.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { recalculateEditableMeshNormals } from './recalculateEditableMeshNormals.js';
import { triangulateEditableMesh } from './triangulateEditableMesh.js';

/** Returns renderer-neutral indexed geometry accepted directly by `create_indexed_geometry`. */
export function lowerEditableMeshToIndexedGeometry(input) {
	const normalized = createEditableMesh(input);
	const withNormals = hasValidNormals(normalized)
		? normalized
		: recalculateEditableMeshNormals(normalized);
	const triangulated = triangulateEditableMesh(withNormals);
	const positions = triangulated.vertices.flatMap(vertex => [...vertex]);
	const normals = triangulated.attributes.normal.flatMap(normal => [...normal]);
	const indices = triangulated.faces.flatMap(face => [...face.vertices]);
	const uvs = validUvs(triangulated.attributes.uv, triangulated.vertices.length)
		? triangulated.attributes.uv.flatMap(uv => [Number(uv[0]), Number(uv[1])])
		: [];
	return Object.freeze({
		id: triangulated.id,
		positions: Object.freeze(positions),
		normals: Object.freeze(normals),
		uvs: Object.freeze(uvs),
		indices: Object.freeze(indices),
		metadata: Object.freeze({
			...triangulated.metadata,
			editableMeshSchema: triangulated.schema,
			polygonFaceCount: normalized.faces.length
		})
	});
}

/** Checks whether authoring normals can pass directly through lowering. */
function hasValidNormals(mesh) {
	const normals = mesh.attributes?.normal;
	return Array.isArray(normals)
		&& normals.length === mesh.vertices.length
		&& normals.every(normal => Array.isArray(normal) && normal.length >= 3 && normal.slice(0, 3).every(Number.isFinite));
}

/** Checks whether authoring UVs match the editable vertex domain. */
function validUvs(uvs, vertexCount) {
	return Array.isArray(uvs)
		&& uvs.length === vertexCount
		&& uvs.every(uv => Array.isArray(uv) && uv.length >= 2 && uv.slice(0, 2).every(Number.isFinite));
}
