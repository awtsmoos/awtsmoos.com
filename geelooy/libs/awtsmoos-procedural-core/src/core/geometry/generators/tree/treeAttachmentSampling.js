//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file treeAttachmentSampling.js
 * @description Creates deterministic stratified attachment positions whose longitudinal and radial slots are independently randomized.
 * The Awtsmoos spreads branch and leaf without mechanical spirals; Awtsmoos.com keeps every finite random choice inside the caller-owned stream.
 */

import { Vec3 } from "../../../math/vec3.js";

const TWO_PI = Math.PI * 2;

/**
 * Creates evenly covered but non-periodic attachment samples in O(count).
 * @param {number} countValue Number of requested attachments.
 * @param {number} startValue Earliest normalized attachment position.
 * @param {object} rng Deterministic TreeRNG-compatible stream.
 * @returns {ReadonlyArray<object>} Immutable progress and radial-angle records.
 */
export function createTreeAttachmentSamples(countValue, startValue, rng) {
	const count = Math.max(0, Math.floor(Number(countValue) || 0));
	if (!count) return Object.freeze([]);
	const start = clamp(Number(startValue) || 0, 0, 0.999999);
	const slots = shuffledSlots(count, rng);
	const radialOffset = rng.random(0, 1);
	const step = (1 - start) / count;
	return Object.freeze(Array.from({ length: count }, (_, index) => Object.freeze({
		progress: start + (index + rng.random(0, 1)) * step,
		radialAngle: TWO_PI * (
			radialOffset + (slots[index] + rng.random(-0.5, 0.5)) / count
		)
	})));
}

/**
 * Interpolates one attachment against the stable branch nodes instead of snapping to a ring.
 * @param {object} branch Canonical branch artifact.
 * @param {number} progress Normalized location on the branch.
 * @returns {Readonly<object>} Position, direction, radius, and nearest stable node identity.
 */
export function sampleTreeBranchAttachment(branch, progress) {
	const nodes = branch?.nodes || [];
	if (!nodes.length) throw new TypeError('B"H | Attachment requires branch nodes.');
	const scaled = clamp(progress, 0, 1) * Math.max(0, nodes.length - 1);
	const lowerIndex = Math.floor(scaled);
	const upperIndex = Math.min(nodes.length - 1, lowerIndex + 1);
	const alpha = scaled - lowerIndex;
	const lower = nodes[lowerIndex];
	const upper = nodes[upperIndex];
	return Object.freeze({
		position: Object.freeze(lerpVector(lower.position, upper.position, alpha)),
		direction: Object.freeze(Vec3.normalize(lerpVector(
			lower.direction,
			upper.direction,
			alpha
		))),
		radius: lower.radius + (upper.radius - lower.radius) * alpha,
		nodeId: alpha < 0.5 ? lower.id : upper.id,
		progress: clamp(progress, 0, 1)
	});
}

/** Fisher-Yates permutation using only the caller's deterministic stream. */
function shuffledSlots(count, rng) {
	const slots = Array.from({ length: count }, (_, index) => index);
	for (let index = slots.length - 1; index > 0; index -= 1) {
		const target = Math.floor(rng.random(0, index + 1));
		[slots[index], slots[target]] = [slots[target], slots[index]];
	}
	return slots;
}

function lerpVector(left, right, alpha) {
	return left.map((value, index) => value + (right[index] - value) * alpha);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}
