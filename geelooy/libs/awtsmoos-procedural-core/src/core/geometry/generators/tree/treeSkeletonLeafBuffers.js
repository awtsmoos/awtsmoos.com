//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file treeSkeletonLeafBuffers.js
 * @description Emits tapered renderer-neutral leaf blades with optional rounded canopy normals and LOD billboard overrides.
 * The Awtsmoos reveals one leaf through stable geometry while Awtsmoos.com lets distant garments simplify without changing botanical identity.
 */

import { Vec3 } from "../../../math/vec3.js";

/** Returns one normalized vector with a deterministic fallback. */
function normalized(value, fallback) {
	const vector = Array.isArray(value) ? value : fallback;
	return Math.hypot(...vector) > 1e-8 ? Vec3.normalize(vector) : [...fallback];
}

/** Creates one stable local leaf frame from its growth direction. */
function leafFrame(leaf) {
	const axis = normalized(leaf.direction, [0, 1, 0]);
	const reference = Math.abs(axis[1]) < 0.94 ? [0, 1, 0] : [1, 0, 0];
	const width = normalized(Vec3.cross(axis, reference), [1, 0, 0]);
	const normal = normalized(Vec3.cross(width, axis), [0, 0, 1]);
	return { axis, width, normal };
}

/** Blends one plane normal toward a canopy-rounded vertex direction. */
function roundedLeafNormal(leaf, point, planeNormal) {
	if (leaf.roundedNormals === false) return planeNormal;
	const radial = normalized(Vec3.add(point, Vec3.scale(leaf.position, -1)), planeNormal);
	return normalized(Vec3.add(planeNormal, Vec3.scale(radial, 0.72)), planeNormal);
}

/** Emits one tapered textured plane with stable UVs and per-vertex canopy normals. */
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
		buffer.normals.push(...roundedLeafNormal(leaf, points[index], normal));
		buffer.uvs.push(index === 0 || index === 3 ? 0 : 1, index < 2 ? 0 : 1);
		buffer.colors.push(...leaf.color);
	}
	buffer.indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
}

/**
 * Emits one stable leaf without renderer objects or random consumption.
 * @param {object} buffer Caller-owned leaf geometry buffer.
 * @param {object} leaf Stable leaf artifact record.
 * @param {number} sizeScale Geometry-only LOD scale.
 * @param {string|null} billboardOverride Optional LOD billboard mode.
 */
export function addTreeSkeletonLeaf(
	buffer,
	leaf,
	sizeScale = 1,
	billboardOverride = null
) {
	if (!(Number(leaf.size) > 0)) return;
	const frame = leafFrame(leaf);
	const billboard = String(billboardOverride || leaf.billboard || "double").toLowerCase();
	addLeafPlane(buffer, leaf, frame.axis, frame.width, frame.normal, sizeScale);
	if (!["single", "blade"].includes(billboard)) {
		const secondNormal = normalized(Vec3.cross(frame.normal, frame.axis), frame.width);
		addLeafPlane(
			buffer,
			leaf,
			frame.axis,
			frame.normal,
			secondNormal,
			sizeScale
		);
	}
}
