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

export function bridgeMeshBoundaries(partA, boundaryA, partB, boundaryB) {
	if (boundaryA.length !== boundaryB.length) {
		throw new Error('B"H | Boundary loops must have equal vertex counts.');
	}
	const positions = [];
	const uvs = [];
	const indices = [];
	const start = copyBoundary(partA, boundaryA, positions, uvs, 0);
	const end = copyBoundary(partB, boundaryB, positions, uvs, 1);

	for (let index = 0; index < start.length; index += 1) {
		const next = (index + 1) % start.length;
		indices.push(
			start[index],
			end[index],
			end[next],
			start[index],
			end[next],
			start[next]
		);
	}
	return {
		positions,
		normals: buildVertexNormals(positions, indices),
		uvs,
		indices,
		boundaries: {
			start,
			end
		}
	};
}

function copyBoundary(part, boundary, positions, uvs, v) {
	const copied = [];
	boundary.forEach((sourceIndex, index) => {
		const sourceOffset = sourceIndex * 3;
		copied.push(positions.length / 3);
		positions.push(
			part.positions[sourceOffset],
			part.positions[sourceOffset + 1],
			part.positions[sourceOffset + 2]
		);
		uvs.push(index / boundary.length, v);
	});
	return copied;
}
