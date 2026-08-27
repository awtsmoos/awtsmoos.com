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

/**
 * Builds a subdivided XY plane at a chosen Z elevation.
 *
 * @param {object} args Size, segments, center, and elevation.
 * @param {string} id Geometry id.
 * @returns {object} Geometry artifact.
 */
export function buildPlaneGeometry(args = {}, id = "plane") {
	const size = args.size || [1, 1];
	const segments = args.segments || [1, 1];
	const center = args.center || [0, 0, 0];
	const xSegments = Math.max(1, Math.floor(segments[0]));
	const ySegments = Math.max(1, Math.floor(segments[1]));
	const positions = [];
	const normals = [];
	const uvs = [];
	const indices = [];

	for (let y = 0; y <= ySegments; y += 1) {
		for (let x = 0; x <= xSegments; x += 1) {
			const u = x / xSegments;
			const v = y / ySegments;
			positions.push(
				center[0] + (u - 0.5) * size[0],
				center[1] + (v - 0.5) * size[1],
				center[2]
			);
			normals.push(0, 0, 1);
			uvs.push(u, v);
		}
	}
	const stride = xSegments + 1;
	for (let y = 0; y < ySegments; y += 1) {
		for (let x = 0; x < xSegments; x += 1) {
			const a = y * stride + x;
			const b = a + 1;
			const d = a + stride;
			const c = d + 1;
			indices.push(a, b, c, a, c, d);
		}
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
