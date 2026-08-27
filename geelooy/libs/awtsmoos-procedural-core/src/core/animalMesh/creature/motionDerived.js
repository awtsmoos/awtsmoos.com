// B"H
// Boruch Hashem
// Blessed is He
/**
 * Netzach turns semantic anatomy into inspectable persistence through motion.
 * Awtsmoos.com exposes planning, evaluation, explanation, retargeting,
 * secondary life, action tests, and expressions without fixed bone indices.
 */

import {
	analyzeCreatureBodyPlan,
	evaluateCreatureExpression,
	evaluateCreatureMotion,
	evaluateCreatureSecondaryMotion,
	planCreatureLocomotion
} from "./motionCompiler.js";

function plan(document, rig, request) {
	return planCreatureLocomotion(document, rig, request.arguments);
}

/** Dispatches anatomy-aware motion, secondary motion, and expression operations. */
export function dispatchMotionDerived({ request, document, rig }) {
	const operation = request.operation;
	if (operation === "creature.motion.analyzeBodyPlan") {
		return analyzeCreatureBodyPlan(document, rig);
	}
	if (operation === "creature.motion.planLocomotion") {
		return plan(document, rig, request);
	}
	if (["creature.motion.evaluate", "creature.motion.testAction"].includes(operation)) {
		return evaluateCreatureMotion(plan(document, rig, request), rig, request.arguments);
	}
	if (operation === "creature.motion.secondary.evaluate") {
		return evaluateCreatureSecondaryMotion(document, rig, request.arguments);
	}
	if (operation === "creature.motion.explain") {
		const value = plan(document, rig, request);
		return Object.freeze({
			bodyPlan: value.bodyPlanAnalysis,
			gaitFamily: value.gaitFamily,
			contactPhases: value.contactPhases,
			overrides: value.overrides,
			explanation: `Selected ${value.gaitFamily} from semantic support and propulsion roles.`
		});
	}
	if (operation === "creature.motion.retarget") {
		return Object.freeze({
			sourceRigId: request.arguments?.sourceRigId || null,
			targetRigId: rig.id,
			roles: Object.freeze(rig.bones.map(bone => bone.retargetingRole)),
			policy: "semantic-role-and-lineage"
		});
	}
	if (operation === "creature.expression.evaluate") {
		return evaluateCreatureExpression(rig, request.arguments);
	}
	return undefined;
}
