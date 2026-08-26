// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnimationGraphMerger.js
 * @description Binds detachable animation fragments to final creature bone ids and evaluates their independent clocks into one renderer-neutral pose.
 * RESPONSIBILITY: preserve fragment ownership, local-to-final bone remaps, fragment overrides, deterministic evaluation order, pose layering, and event provenance.
 * NON-RESPONSIBILITY: this vessel does not synthesize rigs, choose gaits, solve IK, create clips, or mutate fragment clocks.
 * The Awtsmoos lets many local songs enter one embodied dance without erasing the hour or lineage of any limb;
 * Awtsmoos.com carries each local bone-name through Yetzirah, so modular rhythm becomes one visible pose while every fragment keeps its flame.
 */

import { evaluateAnimationFragment } from "./AnimationFragmentEvaluator.js";
import { blendAnimationLayers } from "./AnimationLayerBlend.js";

/**
 * Binds independent animation fragments to one final rig namespace.
 * @param {Array<object>} fragments Detachable animation fragments in deterministic anatomical order.
 * @param {object} rig Final Yetzirah rig exposing `boneMapByFragmentId`.
 * @param {object} [input={}] Optional compile-time fragment overrides.
 * @returns {object} Immutable merged animation graph.
 */
export function mergeAnimationFragments(fragments = [], rig = {}, input = {}) {
	const bindings = fragments.map((fragment) => {
		const boneIdMap = rig.boneMapByFragmentId?.[fragment.rigFragmentId] || {};
		return Object.freeze({
			boneIdMap: Object.freeze({ ...boneIdMap }),
			fragment,
			override: Object.freeze(fragmentOverride(input.fragmentOverrides, fragment)),
			rigFragmentId: fragment.rigFragmentId,
			sourceAnatomyId: fragment.sourceAnatomyId
		});
	});
	return Object.freeze({
		bindings: Object.freeze(bindings),
		fragmentIds: Object.freeze(fragments.map((fragment) => fragment.id)),
		rigId: String(rig.id || ""),
		type: "anatomical-animation-graph",
		version: "1.0.0"
	});
}

/**
 * Evaluates one merged graph while preserving every fragment's independent local clock.
 * @param {object} graph Graph from `mergeAnimationFragments`.
 * @param {number} [globalTime=0] Shared source time supplied to every independent clock.
 * @param {object} [input={}] Runtime fragment overrides keyed by fragment or anatomy identity.
 * @returns {object} Frozen final-bone pose, fragment samples, and provenance-rich events.
 */
export function evaluateAnimationGraph(graph, globalTime = 0, input = {}) {
	const fragmentSamples = graph.bindings.map((binding, index) => {
		return evaluateBinding(binding, globalTime, input.fragmentOverrides, index);
	});
	const layers = fragmentSamples.map((sample) => sample.layer);
	return Object.freeze({
		events: Object.freeze(fragmentSamples.flatMap((sample) => sample.events)),
		fragments: Object.freeze(fragmentSamples.map((sample) => sample.pose)),
		poses: blendAnimationLayers(layers),
		rigId: graph.rigId,
		time: finite(globalTime, 0),
		type: "anatomical-animation-graph-pose",
		version: graph.version
	});
}

/** Evaluates and remaps one fragment binding into a final-bone pose layer. */
function evaluateBinding(binding, globalTime, runtimeOverrides, index) {
	const runtime = fragmentOverride(runtimeOverrides, binding.fragment);
	const options = { ...binding.override, ...runtime };
	const localPose = evaluateAnimationFragment(binding.fragment, globalTime, options);
	const poses = Object.freeze(localPose.poses.flatMap((pose) => {
		const boneId = binding.boneIdMap[pose.localBoneId];
		return boneId
			? [Object.freeze({ ...pose, boneId })]
			: [];
	}));
	const events = localPose.events.map((event) => Object.freeze({
		...event,
		fragmentId: binding.fragment.id,
		sourceAnatomyId: binding.sourceAnatomyId
	}));
	return Object.freeze({
		events: Object.freeze(events),
		layer: Object.freeze({
			mask: options.mask,
			mode: options.mode || "replace",
			poses,
			priority: finite(options.priority, index),
			weight: clamp01(options.weight, 1)
		}),
		pose: Object.freeze({ ...localPose, poses })
	});
}

/** Resolves overrides by animation-fragment id, anatomy id, or rig-fragment id. */
function fragmentOverride(overrides, fragment) {
	if (!overrides || typeof overrides !== "object") return {};
	return overrides[fragment.id]
		|| overrides[fragment.sourceAnatomyId]
		|| overrides[fragment.rigFragmentId]
		|| {};
}

/** Returns one finite scalar or fallback. */
function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

/** Clamps one finite scalar into the normalized range. */
function clamp01(value, fallback) {
	return Math.max(0, Math.min(1, finite(value, fallback)));
}
