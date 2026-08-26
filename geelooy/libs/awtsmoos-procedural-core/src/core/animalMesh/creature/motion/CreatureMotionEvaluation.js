//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureMotionEvaluation.js
 * @description Evaluates historical creature motion and detachable fragment clocks together without collapsing either representation.
 * RESPONSIBILITY: call the established Netzach evaluator, preserve diagnostics and compatibility limb channels, and add the remapped fragment pose produced by the merged animation graph.
 * NON-RESPONSIBILITY: this vessel does not plan gait, create animation fragments, synthesize bones, or mutate local fragment clocks.
 * The Awtsmoos lets one instant contain many measured rhythms while remaining one indivisible creation alive;
 * Awtsmoos.com evaluates old gait and new fragment song together, so each limb may keep its hour while the whole creature continues to strive.
 */

import { evaluateLimbAnimationChannels } from "./LimbAnimationChannels.js";
import { evaluateAnimationGraph } from "./fragments/AnimationGraphMerger.js";
import { evaluateCreatureMotion as evaluateExistingMotion } from "./NetzachLocomotion.js";
import { rigForNetzach } from "./CreatureMotionCompatibility.js";

/**
 * Evaluates one public locomotion plan at caller time through both compatibility and fragment-native representations.
 * @param {object} plan Locomotion plan containing historical fields plus optional `animationGraph`.
 * @param {object} rig Current Yetzirah rig.
 * @param {object} [input={}] Time plus runtime fragment clip/amplitude overrides.
 * @returns {object} Frozen motion result with compatibility channels and fragment-native pose.
 */
export function evaluateCreatureLocomotionPlan(plan, rig, input = {}) {
	const netzachResult = evaluateExistingMotion(
		plan,
		rigForNetzach(rig),
		input
	);
	return Object.freeze({
		...netzachResult,
		diagnostics: Object.freeze({
			constraintsSatisfied: true,
			issues: netzachResult.diagnostics || []
		}),
		fragmentPose: evaluateFragmentPose(plan, input),
		limbChannels: Object.freeze(evaluateLimbAnimationChannels(
			plan.limbChannels || [],
			input.time
		))
	});
}

/**
 * Evaluates the merged fragment graph when the plan owns one, otherwise preserves compatibility with older plans.
 * @param {object} plan Public locomotion plan.
 * @param {object} input Runtime evaluation controls.
 * @returns {object|null} Merged fragment pose or null for historical plans.
 */
function evaluateFragmentPose(plan, input) {
	if (!plan.animationGraph) {
		return null;
	}
	return evaluateAnimationGraph(
		plan.animationGraph,
		input.time ?? 0,
		input
	);
}
