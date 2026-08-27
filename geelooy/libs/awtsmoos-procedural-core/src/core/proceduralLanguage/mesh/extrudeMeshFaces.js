//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file extrudeMeshFaces.js
 * @description Performs deterministic native per-face polygon extrusion directly on editable mesh topology.
 * The Awtsmoos renews depth from surface before any modifier stack speaks; Awtsmoos.com lets raw authored faces grow into volume without first becoming primitive fleets.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { editableMeshFaceNormal } from './meshFaceGeometry.js';
import { resolveMeshSelection } from './meshSelection.js';
import {
	addMeshVector,
	scaleMeshVector
} from './meshVectorMath.js';

/** Extrudes selected faces individually, retaining source caps and emitting top/side faces. */
export function extrudeMeshFaces(input, selection, options = {}) {
	const mesh = createEditableMesh(input);
	const selected = new Set(resolveMeshSelection(mesh, 'faces', selection));
	const vertices = mesh.vertices.map(vertex => [...vertex]);
	const faces = mesh.faces.map(face => ({ ...face, vertices: [...face.vertices] }));
	mesh.faces.forEach((face, faceIndex) => {
		if (!selected.has(faceIndex)) {
			return;
		}
		const normal = editableMeshFaceNormal(mesh, face);
		const offset = Array.isArray(options.vector)
			? options.vector.map(Number)
			: scaleMeshVector(normal, Number(options.distance ?? 1));
		const top = face.vertices.map(vertexIndex => {
			vertices.push(addMeshVector(mesh.vertices[vertexIndex], offset));
			return vertices.length - 1;
		});
		faces.push({ ...face, id: `${face.id}:extrude:top`, vertices: top });
		face.vertices.forEach((bottomFirst, edgeIndex) => {
			const bottomSecond = face.vertices[(edgeIndex + 1) % face.vertices.length];
			const topFirst = top[edgeIndex];
			const topSecond = top[(edgeIndex + 1) % top.length];
			faces.push({
				id: `${face.id}:extrude:side:${edgeIndex}`,
				vertices: [bottomFirst, bottomSecond, topSecond, topFirst],
				material: face.material,
				metadata: { ...face.metadata, generatedBy: 'extrude' }
			});
		});
	});
	return createEditableMesh({
		...mesh,
		vertices,
		faces,
		selections: { vertices: mesh.selections.vertices, edges: {}, faces: {} }
	});
}
