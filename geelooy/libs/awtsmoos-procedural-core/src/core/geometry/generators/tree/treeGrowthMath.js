// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews each scalar and radial frame beneath the visible tree.
 * These Awtsmoos.com helpers are pure, deterministic, and renderer-neutral.
 */
import { Vec3 } from "../../../math/vec3.js";

export const GOLDEN_TREE_ANGLE = 2.3999632297;

export function treeNumber(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export function treeValueAt(object, level, fallback) {
	return object?.[level] ?? object?.[String(level)] ?? fallback;
}

export function clampTreeValue(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}

export function treeRadialDirection(direction, theta) {
	const up = Math.abs(Vec3.dot(direction, [0, 1, 0])) > 0.92 ? [1, 0, 0] : [0, 1, 0];
	const right = Vec3.normalize(Vec3.cross(direction, up));
	const forward = Vec3.normalize(Vec3.cross(right, direction));
	return Vec3.normalize(Vec3.add(
		Vec3.scale(right, Math.cos(theta)),
		Vec3.scale(forward, Math.sin(theta))
	));
}

export function treeSkeletonSignature(records) {
	let hash = 2166136261;
	for (const record of records) {
		const text = `${record.level}:${record.start.map(format)}:${record.end.map(format)}`;
		for (let index = 0; index < text.length; index += 1) {
			hash ^= text.charCodeAt(index);
			hash = Math.imul(hash, 16777619);
		}
	}
	return `tree-skeleton-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function format(value) {
	return value.toFixed(5);
}
