// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	createGeometryArtifact
} from "../artifact/createGeometryArtifact.js";
import {
	buildVertexNormals
} from "./buildVertexNormals.js";

/**
 * Extrudes one closed XY profile along positive and negative Z.
 *
 * @param {object} args Profile, depth, center, and cap flags.
 * @param {string} id Geometry id.
 * @returns {object} Geometry artifact.
 */
export function buildExtrudedProfile(args = {}, id = "extrusion") {
	const profile = args.profile || [];
	if (profile.length < 3) {
		throw new Error('B"H | Extrusion profiles require at least three points.');
	}
	const depth = args.depth ?? 1;
	const center = args.center || [0, 0, 0];
	const positions = [];
	const uvs = [];
	const indices = [];
	const count = profile.length;

	for (let layer = 0; layer <= 1; layer += 1) {
		for (let index = 0; index < count; index += 1) {
			const point = profile[index];
			positions.push(
				center[0] + point[0],
				center[1] + point[1],
				center[2] + (layer - 0.5) * depth
			);
			uvs.push(index / count, layer);
		}
	}
	for (let index = 0; index < count; index += 1) {
		const next = (index + 1) % count;
		indices.push(index, next, count + next);
		indices.push(index, count + next, count + index);
	}
	appendFan(indices, 0, count, true, args.cap_start !== false);
	appendFan(indices, count, count, false, args.cap_end !== false);
	return createGeometryArtifact({
		id,
		attributes: {
			position: {itemSize: 3, array: positions},
			normal: {
				itemSize: 3,
				array: buildVertexNormals(positions, indices)
			},
			uv: {itemSize: 2, array: uvs}
		},
		indices
	});
}

function appendFan(indices, offset, count, reverse, enabled) {
	if (!enabled) {
		return;
	}
	for (let index = 1; index < count - 1; index += 1) {
		indices.push(...(reverse
			? [offset, offset + index + 1, offset + index]
			: [offset, offset + index, offset + index + 1]));
	}
}
