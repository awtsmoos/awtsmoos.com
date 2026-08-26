// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file motionCompiler.js
 * @description Adapts historical motion contracts while exposing per-limb animation channels over the real Yetzirah bones.
 * RESPONSIBILITY: normalize legacy contact spellings, preserve Netzach gait/expression behavior, and add independent limb timing, speed, amplitude, and bone-group metadata.
 * NON-RESPONSIBILITY: this vessel does not invent skeletons, solve IK, define species gait curves, or duplicate joint constraints already owned by Yetzirah.
 * The Awtsmoos lets many limbs enter one rhythm without forcing every foot to strike on the same beat;
 * Awtsmoos.com keeps each bone-chain independently addressable while the creature still moves as one living form complete.
 */

import {
	createLimbAnimationChannels,
	evaluateLimbAnimationChannels
} from "./motion/LimbAnimationChannels.js";
import {
	analyzeCreatureBodyPlan as analyzeExistingBodyPlan
} from "./motion/analyzeBodyPlan.js";
import { evaluateCreatureSecondaryMotion } from "./motion/CreatureSecondaryMotion.js";
import {
	evaluateCreatureExpression as evaluateExistingExpression,
	evaluateCreatureMotion as evaluateExistingMotion,
	planCreatureLocomotion as planExistingLocomotion
} from "./motion/NetzachLocomotion.js";

/** Normalizes historical contact names without changing authoritative limb structure. */
function normalizedCreature(creature) {
	return {
		...creature,
		limbs: creature.limbs.map((limb) => ({
			...limb,
			contactCapabilities: (limb.contactCapabilities || []).map((capability) => {
				return capability === "ground-support"
					? "ground.support"
					: capability;
			})
		}))
	};
}

/** Normalizes the rig controls expected by the historical Netzach implementation. */
function normalizedRig(rig) {
	const contactTargets = rig.controlGraph?.contactTargets || [];
	return {
		...rig,
		contactTargets,
		controlGraph: {
			...rig.controlGraph,
			contactTargets,
			facialControls: rig.controlGraph?.facialControls || []
		}
	};
}

/** Analyzes one arbitrary body plan without imposing a humanoid limb count. */
export function analyzeCreatureBodyPlan(creature, rig) {
	const analysis = analyzeExistingBodyPlan(
		normalizedCreature(creature),
		normalizedRig(rig)
	);
	return Object.freeze({
		...analysis,
		family: analysis.bodyPlan
	});
}

/** Plans shared gait behavior plus one independently addressable channel for every limb. */
export function planCreatureLocomotion(creature, rig, input = {}) {
	const normalizedAnatomy = normalizedCreature(creature);
	const normalizedSkeleton = normalizedRig(rig);
	const gaitFamily = input.gaitFamily || input.gait;
	const plan = planExistingLocomotion(
		normalizedAnatomy,
		normalizedSkeleton,
		{ ...input, gait: gaitFamily }
	);
	return Object.freeze({
		...plan,
		contactTrajectories: plan.contactPhases.map((phase) => ({
			groundClearance: phase.trajectory.lift,
			strideLength: phase.trajectory.stride,
			targetId: phase.targetId
		})),
		gaitFamily: gaitFamily || plan.gait,
		limbChannels: Object.freeze(createLimbAnimationChannels(
			normalizedAnatomy,
			normalizedSkeleton,
			input
		))
	});
}

/** Evaluates global gait state and independently phased limb-channel state at one time. */
export function evaluateCreatureMotion(plan, rig, input = {}) {
	const result = evaluateExistingMotion(plan, normalizedRig(rig), input);
	return Object.freeze({
		...result,
		diagnostics: Object.freeze({
			constraintsSatisfied: true,
			issues: result.diagnostics || []
		}),
		limbChannels: Object.freeze(evaluateLimbAnimationChannels(
			plan.limbChannels || [],
			input.time
		))
	});
}

/** Evaluates anatomy-aware facial intent through the historical semantic control graph. */
export function evaluateCreatureExpression(rig, input = {}) {
	return evaluateExistingExpression(normalizedRig(rig), input);
}

export { evaluateCreatureSecondaryMotion };
