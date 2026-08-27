// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	buildVertexNormals
} from "./normalBuilder.js";

export function mirrorMeshPart(part, plane = "X", offset = 0) {
	const axis = {
		X: 0,
		Y: 1,
		Z: 2
	}[plane];
	if (axis === undefined) {
		throw new Error(`B"H | Unknown mirror plane: ${plane}`);
	}
	const positions = [
		...part.positions
	];
	for (let index = axis; index < positions.length; index += 3) {
		positions[index] = offset * 2 - positions[index];
	}
	const indices = [];
	for (let index = 0; index < part.indices.length; index += 3) {
		indices.push(
			part.indices[index],
			part.indices[index + 2],
			part.indices[index + 1]
		);
	}
	return {
		...part,
		positions,
		indices,
		normals: buildVertexNormals(positions, indices),
		boundaries: mirrorBoundaries(part.boundaries)
	};
}

function mirrorBoundaries(boundaries = {}) {
	return Object.fromEntries(
		Object.entries(boundaries).map(([name, boundary]) => [
			name,
			[
				...boundary
			].reverse()
		])
	);
}
