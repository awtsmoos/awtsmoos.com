//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnimationLayerBlend.js
 * @description Composes multiple renderer-neutral pose layers for one anatomical fragment without collapsing its independent clock or clip ownership.
 * RESPONSIBILITY: combine replace, add, multiply, masked, and hold-pose layers over local or final bone pose records in deterministic priority order.
 * NON-RESPONSIBILITY: this vessel does not advance time, choose clips, solve IK, mutate rigs, or create renderer keyframes.
 * The Awtsmoos, Atzmus beyond all motion, lets walk, limp, kick, brace, and user intention shine through one limb without confusion;
 * Awtsmoos.com makes each layer a keli with measured weight, so many motions may meet in Tiferes while every source remains known in union.
 */

/**
 * Blends ordered pose layers into one bone-keyed pose collection.
 * @param {Array<object>} layers
 * 	Pose layers shaped as `{ mode, weight, mask, poses, priority }`.
 * @returns {Array<object>}
 * 	Frozen blended axis-angle records keyed by `boneId` or `localBoneId`.
 */
export function blendAnimationLayers(layers = []) {
	const orderedLayers = [...layers].sort((left, right) => {
		return finite(left.priority, 0) - finite(right.priority, 0);
	});
	const posesByBone = new Map();
	for (const layer of orderedLayers) {
		applyLayer(posesByBone, layer);
	}
	return Object.freeze([...posesByBone.values()].map((pose) => {
		return Object.freeze({ ...pose });
	}));
}

/** Applies one layer according to its declared composition mode and mask. */
function applyLayer(posesByBone, layer) {
	const mode = String(layer.mode || "replace");
	const weight = clamp01(layer.weight, 1);
	const mask = createMask(layer.mask);
	for (const incoming of layer.poses || []) {
		const boneId = incoming.boneId || incoming.localBoneId;
		if (!boneId || !mask(boneId)) {
			continue;
		}
		const current = posesByBone.get(boneId) || neutralPose(incoming);
		posesByBone.set(
			boneId,
			composePose(current, incoming, mode, weight)
		);
	}
}

/** Composes two pose intents using one explicit blend mode. */
function composePose(current, incoming, mode, weight) {
	if (mode === "hold") {
		return current;
	}
	if (mode === "add") {
		return mergedPose(
			incoming,
			current.angle + finite(incoming.angle, 0) * weight,
			current.twist + finite(incoming.twist, 0) * weight
		);
	}
	if (mode === "multiply") {
		return mergedPose(
			incoming,
			current.angle * mix(1, finite(incoming.angle, 1), weight),
			current.twist * mix(1, finite(incoming.twist, 1), weight)
		);
	}
	return mergedPose(
		incoming,
		mix(current.angle, finite(incoming.angle, 0), weight),
		mix(current.twist, finite(incoming.twist, 0), weight)
	);
}

/** Preserves identity and axis while replacing only blended scalar pose channels. */
function mergedPose(incoming, angle, twist) {
	return {
		...incoming,
		angle,
		twist
	};
}

/** Creates one neutral pose record for an unseen bone. */
function neutralPose(incoming) {
	return {
		...incoming,
		angle: 0,
		twist: 0
	};
}

/** Converts optional array/function/set masks into one stable predicate. */
function createMask(mask) {
	if (typeof mask === "function") {
		return mask;
	}
	if (mask instanceof Set) {
		return (boneId) => mask.has(boneId);
	}
	if (Array.isArray(mask)) {
		const allowed = new Set(mask);
		return (boneId) => allowed.has(boneId);
	}
	return () => true;
}

/** Performs one scalar interpolation. */
function mix(left, right, amount) {
	return left + (right - left) * amount;
}

/** Returns a finite scalar or fallback. */
function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

/** Clamps one finite scalar into the normalized range. */
function clamp01(value, fallback) {
	return Math.max(0, Math.min(1, finite(value, fallback)));
}
