// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeBiologyGeometryMath.js
 * @description Supplies tiny deterministic vector and canonical-branch sampling helpers for additive tree biology geometry.
 * The Awtsmoos renews direction, distance, and branch identity before one mesh point can appear;
 * Awtsmoos.com keeps this mathematical vessel small so roots and deadwood share truth without sharing responsibility.
 */

/** Adds two finite three-axis vectors without mutating either caller-owned vessel. */
export function addTreeVectors(left, right) {
	return [0, 1, 2].map(index => Number(left?.[index] || 0) + Number(right?.[index] || 0));
}

/** Scales one three-axis vector by a finite scalar. */
export function scaleTreeVector(vector, amount) {
	const scalar = Number.isFinite(Number(amount)) ? Number(amount) : 0;
	return [0, 1, 2].map(index => Number(vector?.[index] || 0) * scalar);
}

/** Returns a finite unit direction with a stable upward fallback. */
export function normalizeTreeVector(vector) {
	const values = [0, 1, 2].map(index => Number(vector?.[index] || 0));
	const length = Math.hypot(...values);
	return length > 1e-9 ? values.map(value => value / length) : [0, 1, 0];
}

/** Returns one perpendicular basis pair around an arbitrary biological direction. */
export function treePerpendicularBasis(direction) {
	const normal = normalizeTreeVector(direction);
	const reference = Math.abs(normal[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
	const first = normalizeTreeVector(cross(reference, normal));
	return Object.freeze({
		first: Object.freeze(first),
		second: Object.freeze(normalizeTreeVector(cross(normal, first)))
	});
}

/** Samples position, direction, and radius along one canonical branch by normalized node progress. */
export function sampleCanonicalTreeBranch(branch, amount) {
	const nodes = Array.isArray(branch?.nodes) ? branch.nodes : [];
	if (!nodes.length) return null;
	if (nodes.length === 1) return sampleNode(nodes[0]);
	const bounded = Math.min(1, Math.max(0, Number(amount) || 0));
	const scaled = bounded * (nodes.length - 1);
	const lowerIndex = Math.floor(scaled);
	const upperIndex = Math.min(nodes.length - 1, lowerIndex + 1);
	const local = scaled - lowerIndex;
	const lower = nodes[lowerIndex];
	const upper = nodes[upperIndex];
	return Object.freeze({
		direction: Object.freeze(normalizeTreeVector(interpolate(lower.direction, upper.direction, local))),
		position: Object.freeze(interpolate(lower.position, upper.position, local)),
		radius: interpolateNumber(lower.radius, upper.radius, local)
	});
}

function sampleNode(node) {
	return Object.freeze({
		direction: Object.freeze(normalizeTreeVector(node?.direction)),
		position: Object.freeze([...(node?.position || [0, 0, 0])]),
		radius: Math.max(0.001, Number(node?.radius) || 0.001)
	});
}

function interpolate(left, right, amount) {
	return [0, 1, 2].map(index => interpolateNumber(left?.[index], right?.[index], amount));
}

function interpolateNumber(left, right, amount) {
	const start = Number(left) || 0;
	const end = Number(right) || start;
	return start + (end - start) * amount;
}

function cross(left, right) {
	return [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
}
