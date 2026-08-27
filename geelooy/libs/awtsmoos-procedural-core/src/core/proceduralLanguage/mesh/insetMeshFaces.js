//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file insetMeshFaces.js
 * @description Performs a deterministic centroid-based native inset on arbitrary selected polygon faces.
 * The Awtsmoos reveals inner boundary from outer face while Awtsmoos.com keeps this native solver honest and small;
 * advanced Blender offset rules remain adapter intent, but direct polygon authors still receive a real editable wall.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { editableMeshFaceCentroid } from './meshFaceGeometry.js';
import { resolveMeshSelection } from './meshSelection.js';

/** Insets selected faces toward their centroid by factor in [0,1). */
export function insetMeshFaces(input, selection, options = {}) {
	const mesh = createEditableMesh(input);
	const selected = new Set(resolveMeshSelection(mesh, 'faces', selection));
	const factor = Math.max(0, Math.min(0.999, Number(options.factor ?? options.amount ?? 0.2)));
	const vertices = mesh.vertices.map(vertex => [...vertex]);
	const faces = [];
	mesh.faces.forEach((face, faceIndex) => {
		if (!selected.has(faceIndex)) {
			faces.push(face);
			return;
		}
		const center = editableMeshFaceCentroid(mesh, face);
		const inner = face.vertices.map(vertexIndex => {
			const source = mesh.vertices[vertexIndex];
			vertices.push(source.map((value, axis) => value + (center[axis] - value) * factor));
			return vertices.length - 1;
		});
		faces.push({ ...face, id: `${face.id}:inset:inner`, vertices: inner });
		face.vertices.forEach((outerFirst, edgeIndex) => {
			const outerSecond = face.vertices[(edgeIndex + 1) % face.vertices.length];
			const innerFirst = inner[edgeIndex];
			const innerSecond = inner[(edgeIndex + 1) % inner.length];
			faces.push({
				id: `${face.id}:inset:ring:${edgeIndex}`,
				vertices: [outerFirst, outerSecond, innerSecond, innerFirst],
				material: face.material,
				metadata: { ...face.metadata, generatedBy: 'inset' }
			});
		});
	});
	return createEditableMesh({ ...mesh, vertices, faces, selections: { vertices: mesh.selections.vertices, edges: {}, faces: {} } });
}
