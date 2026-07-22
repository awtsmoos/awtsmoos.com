// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals one lawful vector vocabulary beneath every branch.
 * These Awtsmoos.com helpers reuse the established Vec3 kernel and add only
 * tree-specific sampling, rounding, and semantic color normalization.
 */

import { Vec3 } from "../../../math/vec3.js";

export const GOLDEN_TREE_ANGLE = 2.399963229728653;

export function clampTreeSkeletonValue(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}

export function roundTreeSkeletonValue(value) {
	return Number(value.toFixed(8));
}

export function treeSkeletonValue(config, name, level, fallback) {
	const values = config.branch?.[name];
	return Number(values?.[level] ?? values?.[String(level)] ?? fallback);
}

export function createTreeSkeletonBranchDirection(parent, angle, azimuth) {
	const tangent = Vec3.normalize(parent);
	const reference = Math.abs(tangent[1]) < 0.95 ? [0, 1, 0] : [1, 0, 0];
	const right = Vec3.normalize(Vec3.cross(tangent, reference));
	const forward = Vec3.normalize(Vec3.cross(right, tangent));
	return Vec3.normalize(Vec3.add(
		Vec3.scale(tangent, Math.cos(angle)),
		Vec3.add(
			Vec3.scale(right, Math.sin(angle) * Math.cos(azimuth)),
			Vec3.scale(forward, Math.sin(angle) * Math.sin(azimuth))
		)
	));
}

export function normalizeTreeSkeletonColor(value) {
	if (Array.isArray(value)) {
		return [value[0] ?? 1, value[1] ?? 1, value[2] ?? 1, value[3] ?? 1];
	}
	if (Number.isFinite(Number(value))) {
		return [
			((value >> 16) & 255) / 255,
			((value >> 8) & 255) / 255,
			(value & 255) / 255,
			1
		];
	}
	return [1, 1, 1, 1];
}
