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
 * Revolves a radius-height profile around the Z axis.
 *
 * @param {object} args Profile, center, radial segments, and angle range.
 * @param {string} id Geometry id.
 * @returns {object} Geometry artifact.
 */
export function buildRevolvedProfile(args = {}, id = "revolution") {
	const profile = args.profile || [];
	if (profile.length < 2) {
		throw new Error('B"H | Revolve profiles require at least two points.');
	}
	const segments = Math.max(3, Math.floor(args.radial_segments || 24));
	const startAngle = (args.start_angle || 0) * Math.PI / 180;
	const endAngle = (args.end_angle ?? 360) * Math.PI / 180;
	const center = args.center || [0, 0, 0];
	const positions = [];
	const uvs = [];
	const indices = [];

	for (let ring = 0; ring <= segments; ring += 1) {
		const u = ring / segments;
		const angle = startAngle + (endAngle - startAngle) * u;
		for (let index = 0; index < profile.length; index += 1) {
			const [radius, height] = profile[index];
			positions.push(
				center[0] + Math.cos(angle) * radius,
				center[1] + Math.sin(angle) * radius,
				center[2] + height
			);
			uvs.push(u, index / (profile.length - 1));
		}
	}
	const stride = profile.length;
	for (let ring = 0; ring < segments; ring += 1) {
		for (let index = 0; index < profile.length - 1; index += 1) {
			const a = ring * stride + index;
			const b = a + stride;
			indices.push(a, b, a + 1, a + 1, b, b + 1);
		}
	}
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
