//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file motionCompiler.js
 * @description Preserves the historical creature-motion facade while delegating modern locomotion planning and fragment-native evaluation to focused modules.
 * RESPONSIBILITY: keep the public motion API stable, route body-plan analysis and locomotion planning through the modular planner, route evaluation through the fragment-aware evaluator, and preserve historical facial/secondary-motion exports.
 * NON-RESPONSIBILITY: this facade does not normalize anatomy itself, build limb channels itself, construct animation fragments, synthesize skeletons, or solve IK.
 * The Awtsmoos reveals one living motion through many hidden measures, while Awtsmoos.com keeps the doorway simple and the inner chambers bright;
 * old callers still speak the same names, yet every detachable limb may now carry its own clock without being torn from the creature's unified flight.
 */

import { evaluateCreatureSecondaryMotion } from "./motion/CreatureSecondaryMotion.js";
import {
	analyzeCreatureLocomotionBodyPlan,
	createCreatureLocomotionPlan
} from "./motion/CreatureLocomotionPlan.js";
import { evaluateCreatureLocomotionPlan } from "./motion/CreatureMotionEvaluation.js";
import { rigForNetzach } from "./motion/CreatureMotionCompatibility.js";
import {
	evaluateCreatureExpression as evaluateExistingExpression
} from "./motion/NetzachLocomotion.js";

/**
 * Analyzes one arbitrary creature body plan without imposing humanoid, quadruped, or fixed-limb assumptions.
 * @param {object} creature Authoritative creature anatomy.
 * @param {object} rig Current Yetzirah rig.
 * @returns {object} Frozen body-plan analysis with the stable historical `family` alias.
 */
export function analyzeCreatureBodyPlan(creature, rig) {
	return analyzeCreatureLocomotionBodyPlan(creature, rig);
}

/**
 * Plans historical Netzach locomotion plus independently clocked detachable limb animation fragments.
 * @param {object} creature Authoritative creature anatomy.
 * @param {object} rig Current Yetzirah rig containing fragment metadata when available.
 * @param {object} [input={}] Gait, phase-layout, clip, clock, and per-limb override controls.
 * @returns {object} Frozen locomotion plan preserving historical fields and adding `animationGraph`.
 */
export function planCreatureLocomotion(creature, rig, input = {}) {
	return createCreatureLocomotionPlan(creature, rig, input);
}

/**
 * Evaluates one locomotion plan through both the historical representation and detachable fragment clocks.
 * @param {object} plan Locomotion plan returned by `planCreatureLocomotion`.
 * @param {object} rig Current Yetzirah rig.
 * @param {object} [input={}] Time and runtime fragment override controls.
 * @returns {object} Frozen result preserving old fields and adding `fragmentPose`.
 */
export function evaluateCreatureMotion(plan, rig, input = {}) {
	return evaluateCreatureLocomotionPlan(plan, rig, input);
}

/**
 * Evaluates anatomy-aware facial intent through the historical semantic control graph.
 * @param {object} rig Current Yetzirah rig.
 * @param {object} [input={}] Expression controls.
 * @returns {object} Historical expression-evaluation result.
 */
export function evaluateCreatureExpression(rig, input = {}) {
	return evaluateExistingExpression(rigForNetzach(rig), input);
}

export { evaluateCreatureSecondaryMotion };
