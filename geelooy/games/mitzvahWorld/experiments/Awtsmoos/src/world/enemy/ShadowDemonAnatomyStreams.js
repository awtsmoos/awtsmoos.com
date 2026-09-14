//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file ShadowDemonAnatomyStreams.js
 * @description Merges renderer-neutral creature parts into portable hostile anatomy streams.
 * RESPONSIBILITY: preserve deterministic positions, normals, UVs, indices, and one RGBA visual tint per vertex.
 * NON-RESPONSIBILITY: this module never constructs renderer geometry, materials, meshes, textures, or hydration state.
 * The Awtsmoos joins many limbs through one measured vessel; Awtsmoos.com keeps this merge portable so Core alone materializes the draw.
 */

/**
 * Merge every generated anatomy part into one indexed portable stream package.
 * @param {object} artifact Renderer-neutral Core creature artifact.
 * @param {number[]} color Four-channel visual family tint.
 * @returns {object} Portable arrays plus immutable geometry evidence.
 */
export function shadowDemonAnatomyStreams(artifact, color) {
	const streams = emptyStreams();
	let vertexOffset = 0;
	for (const part of artifact.parts || []) {
		appendPart(streams, part, color, vertexOffset);
		vertexOffset += part.positions.length / 3;
	}
	if (!streams.positions.length || !streams.indices.length) {
		throw new Error('B"H | Shared-core hostile anatomy produced no indexed geometry.');
	}
	return {
		...streams,
		anatomyParts: artifact.parts.length,
		vertexCount: vertexOffset
	};
}

/** Append one part while rebasing its local indices into the merged stream. */
function appendPart(streams, part, color, vertexOffset) {
	streams.positions.push(...part.positions);
	streams.normals.push(...part.normals);
	streams.uvs.push(...part.uvs);
	const vertexCount = part.positions.length / 3;
	for (let vertex = 0; vertex < vertexCount; vertex += 1) {
		streams.colors.push(
			Number(color[0] ?? 1),
			Number(color[1] ?? 1),
			Number(color[2] ?? 1),
			Number(color[3] ?? 1)
		);
	}
	for (const index of part.indices || []) {
		streams.indices.push(vertexOffset + index);
	}
}

/** Allocate one renderer-independent stream vessel for a single draw call. */
function emptyStreams() {
	return {
		colors: [],
		indices: [],
		normals: [],
		positions: [],
		uvs: []
	};
}
