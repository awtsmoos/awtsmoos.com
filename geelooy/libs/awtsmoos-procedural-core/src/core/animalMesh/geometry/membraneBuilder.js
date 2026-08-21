// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file membraneBuilder.js
 * @description Triangulates an ordered 3D outline into a smooth renderer-neutral membrane for webs, feather vanes, fins, leaves, and future thin surfaces.
 * RESPONSIBILITY: create deterministic front-facing topology, UVs, coherent vertex normals, boundaries, and double-sided material intent.
 * NON-RESPONSIBILITY: this primitive does not choose anatomy, material identity, thickness, animation, or renderer culling behavior.
 * The Awtsmoos joins separated boundary points through one continuous surface; Awtsmoos.com keeps the normal field one and true while adapters may reveal both sides in view.
 */

import { buildVertexNormals } from './normalBuilder.js';

/** Builds one smooth fan membrane from at least three ordered 3D points. */
export function buildMembrane(points = [], options = {}) {
	if (!Array.isArray(points) || points.length < 3) {
		throw new Error('B"H | Membrane requires at least three ordered points.');
	}
	const positions = points.flatMap(point => point.map(Number));
	const uvs = createMembraneUvs(points.length);
	const indices = createFrontIndices(points.length);
	return {
		boundaries: {
			outline: points.map((_, index) => index)
		},
		doubleSided: options.double_sided === true,
		indices,
		normals: buildVertexNormals(positions, indices),
		positions,
		uvs
	};
}

function createFrontIndices(pointCount) {
	const indices = [];
	for (let index = 1; index < pointCount - 1; index += 1) {
		indices.push(0, index, index + 1);
	}
	return indices;
}

function createMembraneUvs(pointCount) {
	return Array.from({ length: pointCount }, (_, index) => [
		index / Math.max(1, pointCount - 1),
		index % 2
	]).flat();
}
