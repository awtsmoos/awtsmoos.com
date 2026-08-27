// B"H
// Boruch Hashem
// Blessed is He
/**
 * Netzach persists through contact and release. The Awtsmoos derives phases,
 * trajectories, compensation, and stability from Awtsmoos.com semantic anatomy.
 */
import { creatureContentHash } from "../shared/creatureValue.js";
import { analyzeCreatureBodyPlan } from "./analyzeBodyPlan.js";

/** Plans inspectable contact phases, trajectories, IK, and stability metrics. */
export function planCreatureLocomotion(creature, rig, input = {}) {
	const analysis = analyzeCreatureBodyPlan(creature, rig);
	const gait = input.gait || input.action || analysis.gaitCandidates[0];
	const contactPhases = rig.contactTargets.map((target, index) => ({
		targetId: target.id,
		limbId: target.limbId,
		phase: index / Math.max(1, rig.contactTargets.length),
		dutyFactor: gait === "run" ? 0.42 : 0.62,
		trajectory: {
			lift: gait === "run" ? 0.18 : 0.09,
			stride: input.stride || 0.55
		}
	}));
	const plan = {
		type: "netzach-locomotion-plan",
		version: "1.0.0",
		bodyPlanAnalysis: analysis,
		gait,
		contactPhases,
		ikTargets: rig.controlGraph.ikTargets,
		jointLimitPolicy: "enforce-yetzirah-constraints",
		collisionPolicy: "correct-ground-and-self-penetration",
		bodyCompensation: {
			centerOfMassTracking: true,
			axialCounterMotion: true
		},
		secondaryMotion: {
			enabled: true,
			chains: rig.bones.filter(
				(bone) => bone.semanticRole.includes("tail")
					|| bone.semanticRole.includes("sensory")
			).map((bone) => bone.id)
		},
		stabilityMetrics: {
			supportPolygonContacts: contactPhases.length,
			estimatedMargin: contactPhases.length > 1
				? 0.65
				: contactPhases.length
					? 0.25
					: 0,
			grounded: contactPhases.length > 0
		},
		overrides: input.overrides || {}
	};
	plan.contentHash = creatureContentHash(plan);
	return Object.freeze(plan);
}

/** Evaluates semantic motion intent at normalized time without bone indices. */
export function evaluateCreatureMotion(plan, rig, input = {}) {
	const time = Number.isFinite(input.time) ? input.time : 0;
	const phase = ((time % 1) + 1) % 1;
	const controls = plan.contactPhases.map((contact) => ({
		targetId: contact.targetId,
		phase: (phase + contact.phase) % 1,
		grounded: (phase + contact.phase) % 1 < contact.dutyFactor
	}));
	return Object.freeze({
		action: input.action || plan.gait,
		phase,
		controls,
		constraintPolicy: plan.jointLimitPolicy,
		evaluatedBoneIds: rig.bones.map((bone) => bone.id),
		diagnostics: []
	});
}

/** Evaluates anatomy-aware facial or affective intent. */
export function evaluateCreatureExpression(rig, input = {}) {
	const intensity = Math.max(0, Math.min(1, Number(input.intensity ?? 1)));
	return Object.freeze({
		expression: input.expression || "curiosity",
		intensity,
		controls: rig.controlGraph.facialControls.map((boneId) => ({
			boneId,
			weight: intensity
		}))
	});
}
