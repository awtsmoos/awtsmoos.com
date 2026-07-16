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

export function joinMeshParts(parts) {
	const joined = {
		positions: [],
		normals: [],
		uvs: [],
		indices: [],
		boundaries: {}
	};

	for (const part of parts) {
		appendPart(joined, part);
	}
	joined.normals = buildVertexNormals(joined.positions, joined.indices);
	return joined;
}

function appendPart(joined, part) {
	const vertexOffset = joined.positions.length / 3;
	joined.positions.push(...part.positions);
	joined.uvs.push(...normalizedUvs(part));
	joined.indices.push(
		...part.indices.map((index) => index + vertexOffset)
	);
	for (const [name, boundary] of Object.entries(part.boundaries || {})) {
		joined.boundaries[`${part.id || "part"}.${name}`] = boundary.map(
			(index) => index + vertexOffset
		);
	}
}

function normalizedUvs(part) {
	if (part.uvs?.length === part.positions.length / 3 * 2) {
		return part.uvs;
	}
	return new Array(part.positions.length / 3 * 2).fill(0);
}
