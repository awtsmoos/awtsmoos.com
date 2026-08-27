//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file transformMeshSelection.js
 * @description Moves, scales, or rotates explicitly selected raw mesh vertices without requiring primitive objects or scene grouping.
 * The Awtsmoos renews every point before transformation clothes it in another place; Awtsmoos.com lets vertex-level authorship remain optional, pure, and full of grace.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { resolveMeshSelection } from './meshSelection.js';
import {
	addMeshVector,
	meshVertexCentroid,
	rotateMeshPoint,
	subtractMeshVector
} from './meshVectorMath.js';

/** Returns a new mesh after translating selected vertices. */
export function moveMeshVertices(input, selection, offset = [0, 0, 0]) {
	return mapSelectedVertices(input, selection, vertex => {
		return addMeshVector(vertex, offset);
	});
}

/** Returns a new mesh after scaling selected vertices about explicit or selection-centroid pivot. */
export function scaleMeshVertices(input, selection, scale = [1, 1, 1], pivot = null) {
	const mesh = createEditableMesh(input);
	const indices = resolveMeshSelection(mesh, 'vertices', selection);
	const center = pivot || meshVertexCentroid(mesh.vertices, indices);
	const factors = Array.isArray(scale)
		? scale
		: [scale, scale, scale];
	return mapSelectedVertices(mesh, indices, vertex => {
		const local = subtractMeshVector(vertex, center);
		return addMeshVector(center, [
			local[0] * factors[0],
			local[1] * factors[1],
			local[2] * factors[2]
		]);
	});
}

/** Returns a new mesh after XYZ Euler rotation in degrees. */
export function rotateMeshVertices(input, selection, degrees = [0, 0, 0], pivot = null) {
	const mesh = createEditableMesh(input);
	const indices = resolveMeshSelection(mesh, 'vertices', selection);
	const center = pivot || meshVertexCentroid(mesh.vertices, indices);
	return mapSelectedVertices(mesh, indices, vertex => {
		return rotateMeshPoint(vertex, degrees, center);
	});
}

/** Applies one pure vertex mapper to a deterministic selected index set. */
function mapSelectedVertices(input, selection, mapper) {
	const mesh = createEditableMesh(input);
	const selected = new Set(resolveMeshSelection(mesh, 'vertices', selection));
	const vertices = mesh.vertices.map((vertex, index) => {
		if (selected.has(index)) {
			return mapper([...vertex], index);
		}
		return [...vertex];
	});
	return createEditableMesh({
		...mesh,
		vertices
	});
}
