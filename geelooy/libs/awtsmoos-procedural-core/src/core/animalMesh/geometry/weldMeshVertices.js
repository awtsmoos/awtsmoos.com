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

export function weldMeshVertices(part, tolerance = 0.00001) {
	const positions = [];
	const remap = new Map();
	const oldToNew = [];
	const precision = 1 / tolerance;

	for (let index = 0; index < part.positions.length; index += 3) {
		const point = part.positions.slice(index, index + 3);
		const key = point
			.map((value) => Math.round(value * precision))
			.join(":");
		if (!remap.has(key)) {
			remap.set(key, positions.length / 3);
			positions.push(...point);
		}
		oldToNew.push(remap.get(key));
	}
	const indices = part.indices.map((index) => oldToNew[index]);
	const boundaries = Object.fromEntries(
		Object.entries(part.boundaries || {}).map(([name, boundary]) => [
			name,
			boundary.map((index) => oldToNew[index])
		])
	);
	return {
		...part,
		positions,
		indices,
		boundaries,
		normals: buildVertexNormals(positions, indices),
		uvs: new Array(positions.length / 3 * 2).fill(0)
	};
}
