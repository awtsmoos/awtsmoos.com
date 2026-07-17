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
 * Builds a UV sphere or ellipsoid with deterministic seam vertices.
 *
 * @param {object} args Center, radii, and segment counts.
 * @param {string} id Geometry id.
 * @returns {object} Geometry artifact.
 */
export function buildUvSphereGeometry(args = {}, id = "sphere") {
	const center = args.center || [0, 0, 0];
	const radii = args.radii || [0.5, 0.5, 0.5];
	const widthSegments = Math.max(3, Math.floor(args.width_segments || 24));
	const heightSegments = Math.max(2, Math.floor(args.height_segments || 16));
	const positions = [];
	const normals = [];
	const uvs = [];
	const indices = [];

	for (let y = 0; y <= heightSegments; y += 1) {
		const v = y / heightSegments;
		const phi = v * Math.PI;
		for (let x = 0; x <= widthSegments; x += 1) {
			const u = x / widthSegments;
			const theta = u * Math.PI * 2;
			const normal = [
				Math.sin(phi) * Math.cos(theta),
				Math.sin(phi) * Math.sin(theta),
				Math.cos(phi)
			];
			positions.push(
				center[0] + normal[0] * radii[0],
				center[1] + normal[1] * radii[1],
				center[2] + normal[2] * radii[2]
			);
			const adjusted = [
				normal[0] / Math.max(radii[0], 1e-12),
				normal[1] / Math.max(radii[1], 1e-12),
				normal[2] / Math.max(radii[2], 1e-12)
			];
			const length = Math.hypot(...adjusted) || 1;
			normals.push(...adjusted.map((value) => value / length));
			uvs.push(u, 1 - v);
		}
	}
	const stride = widthSegments + 1;
	for (let y = 0; y < heightSegments; y += 1) {
		for (let x = 0; x < widthSegments; x += 1) {
			const a = y * stride + x;
			const b = a + stride;
			if (y > 0) {
				indices.push(a, b, a + 1);
			}
			if (y < heightSegments - 1) {
				indices.push(a + 1, b, b + 1);
			}
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
