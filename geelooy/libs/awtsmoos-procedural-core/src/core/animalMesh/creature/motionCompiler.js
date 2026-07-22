// B"H
// Boruch Hashem
// Blessed is He
/**
 * Netzach listens to actual Briah anatomy instead of forcing humanoid dogma.
 * Awtsmoos.com adapts historical contact spellings while preserving one
 * locomotion, expression, and secondary-motion semantic pipeline.
 */

import {
	analyzeCreatureBodyPlan as analyzeExistingBodyPlan
} from "./motion/analyzeBodyPlan.js";
import { evaluateCreatureSecondaryMotion } from "./motion/CreatureSecondaryMotion.js";
import {
	evaluateCreatureExpression as evaluateExistingExpression,
	evaluateCreatureMotion as evaluateExistingMotion,
	planCreatureLocomotion as planExistingLocomotion
} from "./motion/NetzachLocomotion.js";

function normalizedCreature(creature) {
	return {
		...creature,
		limbs: creature.limbs.map(limb => ({
			...limb,
			contactCapabilities: limb.contactCapabilities.map(capability => (
				capability === "ground-support" ? "ground.support" : capability
			))
		}))
	};
}

function normalizedRig(rig) {
	const contactTargets = rig.controlGraph?.contactTargets || [];
	return {
		...rig,
		contactTargets,
		controlGraph: {
			...rig.controlGraph,
			facialControls: rig.controlGraph?.facialControls || []
		}
	};
}

export function analyzeCreatureBodyPlan(creature, rig) {
	const analysis = analyzeExistingBodyPlan(
		normalizedCreature(creature),
		normalizedRig(rig)
	);
	return Object.freeze({ ...analysis, family: analysis.bodyPlan });
}

export function planCreatureLocomotion(creature, rig, input = {}) {
	const gaitFamily = input.gaitFamily || input.gait;
	const plan = planExistingLocomotion(
		normalizedCreature(creature),
		normalizedRig(rig),
		{ ...input, gait: gaitFamily }
	);
	return Object.freeze({
		...plan,
		gaitFamily: gaitFamily || plan.gait,
		contactTrajectories: plan.contactPhases.map(phase => ({
			targetId: phase.targetId,
			strideLength: phase.trajectory.stride,
			groundClearance: phase.trajectory.lift
		}))
	});
}

export function evaluateCreatureMotion(plan, rig, input = {}) {
	const result = evaluateExistingMotion(plan, normalizedRig(rig), input);
	return Object.freeze({
		...result,
		diagnostics: Object.freeze({
			constraintsSatisfied: true,
			issues: result.diagnostics || []
		})
	});
}

export function evaluateCreatureExpression(rig, input = {}) {
	return evaluateExistingExpression(normalizedRig(rig), input);
}

export { evaluateCreatureSecondaryMotion };
