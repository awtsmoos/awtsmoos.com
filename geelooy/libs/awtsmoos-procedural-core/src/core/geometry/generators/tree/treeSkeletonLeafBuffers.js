// B"H
// Boruch Hashem
// Blessed is He

/**
 * A leaf is a tapered blade rather than a square token. The Awtsmoos.com emitter
 * preserves stable leaf identity while creating one or two renderer-neutral
 * planes from the canonical axis, size, aspect, billboard, and color fields.
 */

import { Vec3 } from "../../../math/vec3.js";

function normalized(value, fallback) {
	const vector = Array.isArray(value) ? value : fallback;
	return Math.hypot(...vector) > 1e-8 ? Vec3.normalize(vector) : [...fallback];
}

function leafFrame(leaf) {
	const axis = normalized(leaf.direction, [0, 1, 0]);
	const reference = Math.abs(axis[1]) < 0.94 ? [0, 1, 0] : [1, 0, 0];
	const width = normalized(Vec3.cross(axis, reference), [1, 0, 0]);
	const normal = normalized(Vec3.cross(width, axis), [0, 0, 1]);
	return { axis, width, normal };
}

function addLeafPlane(buffer, leaf, axis, widthAxis, normal, sizeScale) {
	const length = Math.max(0, Number(leaf.size || 0) * sizeScale);
	const aspect = Math.max(0.05, Number(leaf.aspect || 0.72));
	const rootWidth = length * aspect * 0.34;
	const tipWidth = length * aspect * 0.08;
	const tip = Vec3.add(leaf.position, Vec3.scale(axis, length));
	const start = buffer.positions.length / 3;
	const points = [
		Vec3.add(leaf.position, Vec3.scale(widthAxis, -rootWidth)),
		Vec3.add(leaf.position, Vec3.scale(widthAxis, rootWidth)),
		Vec3.add(tip, Vec3.scale(widthAxis, tipWidth)),
		Vec3.add(tip, Vec3.scale(widthAxis, -tipWidth))
	];
	for (let index = 0; index < points.length; index += 1) {
		buffer.positions.push(...points[index]);
		buffer.normals.push(...normal);
		buffer.uvs.push(index === 0 || index === 3 ? 0 : 1, index < 2 ? 0 : 1);
		buffer.colors.push(...leaf.color);
	}
	buffer.indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
}

/**
 * Emits a stable leaf in O(1) time with no side effects beyond the caller-owned
 * buffer. Zero-sized leaves are ignored and no renderer objects are allocated.
 *
 * @param {Object} buffer Canonical leaf geometry buffer.
 * @param {Object} leaf Stable leaf artifact record.
 * @param {number} sizeScale Geometry-only LOD multiplier.
 */
export function addTreeSkeletonLeaf(buffer, leaf, sizeScale = 1) {
	if (!(Number(leaf.size) > 0)) {
		return;
	}
	const frame = leafFrame(leaf);
	addLeafPlane(buffer, leaf, frame.axis, frame.width, frame.normal, sizeScale);
	if (!["single", "blade"].includes(String(leaf.billboard || "double").toLowerCase())) {
		const secondNormal = normalized(Vec3.cross(frame.normal, frame.axis), frame.width);
		addLeafPlane(buffer, leaf, frame.axis, frame.normal, secondNormal, sizeScale);
	}
}
