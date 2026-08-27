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

const FACES = Object.freeze([
	{normal: [1, 0, 0], corners: [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]]},
	{normal: [-1, 0, 0], corners: [[-1, 1, -1], [-1, -1, -1], [-1, -1, 1], [-1, 1, 1]]},
	{normal: [0, 1, 0], corners: [[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]]},
	{normal: [0, -1, 0], corners: [[1, -1, -1], [-1, -1, -1], [-1, -1, 1], [1, -1, 1]]},
	{normal: [0, 0, 1], corners: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]},
	{normal: [0, 0, -1], corners: [[-1, 1, -1], [1, 1, -1], [1, -1, -1], [-1, -1, -1]]}
]);

/**
 * Builds a seam-correct box with per-face normals and UVs.
 *
 * @param {object} args Box dimensions and center.
 * @param {string} id Geometry id.
 * @returns {object} Geometry artifact.
 */
export function buildBoxGeometry(args = {}, id = "box") {
	const size = args.size || [1, 1, 1];
	const center = args.center || [0, 0, 0];
	const positions = [];
	const normals = [];
	const uvs = [];
	const indices = [];
	for (const face of FACES) {
		const offset = positions.length / 3;
		for (const corner of face.corners) {
			positions.push(
				center[0] + corner[0] * size[0] / 2,
				center[1] + corner[1] * size[1] / 2,
				center[2] + corner[2] * size[2] / 2
			);
			normals.push(...face.normal);
		}
		uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
		indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
	}
	return createGeometryArtifact({
		id,
		attributes: {
			position: {itemSize: 3, array: positions},
			normal: {itemSize: 3, array: normals},
			uv: {itemSize: 2, array: uvs}
		},
		indices
	});
}
