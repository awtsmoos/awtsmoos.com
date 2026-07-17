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
 * Builds an axis-Z cylinder, cone, or frustum.
 *
 * @param {object} args Radii, height, center, segments, and cap flags.
 * @param {string} id Geometry id.
 * @returns {object} Geometry artifact.
 */
export function buildCylinderGeometry(args = {}, id = "cylinder") {
	const radiusBottom = args.radius_bottom ?? args.radius ?? 0.5;
	const radiusTop = args.radius_top ?? args.radius ?? 0.5;
	const height = args.height ?? 1;
	const center = args.center || [0, 0, 0];
	const segments = Math.max(3, Math.floor(args.radial_segments || 24));
	const positions = [];
	const uvs = [];
	const indices = [];

	for (let ring = 0; ring <= 1; ring += 1) {
		const z = center[2] + (ring - 0.5) * height;
		const radius = ring === 0 ? radiusBottom : radiusTop;
		for (let index = 0; index < segments; index += 1) {
			const u = index / segments;
			const angle = u * Math.PI * 2;
			positions.push(
				center[0] + Math.cos(angle) * radius,
				center[1] + Math.sin(angle) * radius,
				z
			);
			uvs.push(u, ring);
		}
	}
	for (let index = 0; index < segments; index += 1) {
		const next = (index + 1) % segments;
		indices.push(index, next, segments + next);
		indices.push(index, segments + next, segments + index);
	}
	appendCap(positions, uvs, indices, center, radiusBottom, -height / 2, segments, true, args.cap_bottom !== false);
	appendCap(positions, uvs, indices, center, radiusTop, height / 2, segments, false, args.cap_top !== false);
	return createGeometryArtifact({
		id,
		attributes: {
			position: {itemSize: 3, array: positions},
			normal: {itemSize: 3, array: buildVertexNormals(positions, indices)},
			uv: {itemSize: 2, array: uvs}
		},
		indices
	});
}

function appendCap(positions, uvs, indices, center, radius, zOffset, segments, reverse, enabled) {
	if (!enabled || radius <= 0) {
		return;
	}
	const centerIndex = positions.length / 3;
	positions.push(center[0], center[1], center[2] + zOffset);
	uvs.push(0.5, 0.5);
	const ringStart = positions.length / 3;
	for (let index = 0; index < segments; index += 1) {
		const angle = index / segments * Math.PI * 2;
		positions.push(
			center[0] + Math.cos(angle) * radius,
			center[1] + Math.sin(angle) * radius,
			center[2] + zOffset
		);
		uvs.push((Math.cos(angle) + 1) / 2, (Math.sin(angle) + 1) / 2);
	}
	for (let index = 0; index < segments; index += 1) {
		const next = ringStart + (index + 1) % segments;
		const current = ringStart + index;
		indices.push(...(reverse
			? [centerIndex, next, current]
			: [centerIndex, current, next]));
	}
}
