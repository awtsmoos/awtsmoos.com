//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file extractMeshFaces.js
 * @description Extracts selected faces into a compact independent editable mesh while remapping vertices, aligned attributes, materials, and semantic groups deterministically.
 * The Awtsmoos remains One when a finite part is separated for work; Awtsmoos.com lets a wheel, bogie, wing, cabin, hull plate, or engine leave and later rejoin without index confusion.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { extractMeshVertexAttributes } from './copyMeshVertexAttributes.js';
import { resolveMeshSelection } from './meshSelection.js';

/** Returns one compact mesh containing only the selected polygon faces and required vertices. */
export function extractMeshFaces(input, selection = 'all', options = {}) {
	const mesh = createEditableMesh(input);
	const faceIndices = resolveMeshSelection(mesh, 'faces', selection);
	const vertexIndices = usedVertices(mesh, faceIndices);
	const remap = new Map(vertexIndices.map((source, index) => [source, index]));
	const faces = faceIndices.map(faceIndex => {
		const face = mesh.faces[faceIndex];
		return {
			...face,
			vertices: face.vertices.map(index => remap.get(index))
		};
	});
	const attributes = extractMeshVertexAttributes(
		mesh.attributes,
		vertexIndices,
		mesh.vertices.length
	);
	attributes.groups = extractGroups(mesh, remap, faceIndices);
	return createEditableMesh({
		...mesh,
		id: String(options.id || `${mesh.id}:extract`),
		vertices: vertexIndices.map(index => [...mesh.vertices[index]]),
		faces,
		attributes,
		selections: { vertices: {}, edges: {}, faces: {} },
		metadata: { ...mesh.metadata, extractedFrom: mesh.id }
	});
}

/** Returns source vertex indices required by selected faces. */
function usedVertices(mesh, faceIndices) {
	const values = new Set();
	for (const faceIndex of faceIndices) {
		for (const vertexIndex of mesh.faces[faceIndex].vertices) {
			values.add(vertexIndex);
		}
	}
	return [...values].sort((left, right) => left - right);
}

/** Remaps semantic groups to compact vertex/face indices inside the extracted mesh. */
function extractGroups(mesh, remap, faceIndices) {
	const faceRemap = new Map(faceIndices.map((source, index) => [source, index]));
	const result = {};
	for (const [id, group] of Object.entries(mesh.attributes?.groups || {})) {
		const faces = (group.faces || [])
			.filter(index => faceRemap.has(index))
			.map(index => faceRemap.get(index));
		const vertices = (group.vertices || [])
			.filter(index => remap.has(index))
			.map(index => remap.get(index));
		if (!faces.length && !vertices.length) {
			continue;
		}
		result[id] = { ...group, faces, vertices, edges: [] };
	}
	return result;
}
