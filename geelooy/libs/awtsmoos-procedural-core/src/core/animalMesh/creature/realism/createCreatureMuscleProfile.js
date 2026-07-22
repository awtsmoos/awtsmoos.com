// B"H
// Boruch Hashem
// Blessed is He
/** Muscles follow semantic bones and joints rather than humanoid assumptions. */

import { createSemanticId } from "../identity.js";

function actuatorForBone(creature, rig, bone, index, options) {
	const leverage = Math.max(0.02, bone.radius * Math.max(0.1, bone.length));
	const role = bone.semanticRole || bone.retargetingRole || "body";
	return Object.freeze({
		id: createSemanticId("muscle-actuator", creature.id, bone.id, index),
		boneId: bone.id,
		parentBoneId: bone.parentBoneId ?? null,
		sourceAnatomyId: bone.sourceAnatomyId,
		role,
		fiberDirection: Object.freeze([1, 0, 0]),
		maximumForce: leverage * Number(options.forceScale ?? 1400),
		contractionRange: Object.freeze([0.72, 1.08]),
		activationSpeed: /wing|fin/.test(role) ? 18 : /jaw|facial/.test(role) ? 22 : 9,
		fatigueRate: /locomotion/.test(role) ? 0.035 : 0.018,
		elasticReturn: 0.64,
		bulge: Object.freeze({ radiusGain: 0.18, volumePreserving: true })
	});
}

/** Creates arbitrary-rig actuators, tendons, and soft appendage motion. */
export function createCreatureMuscleProfile(creature, rig, options = {}) {
	const actuators = rig.bones
		.filter((bone) => bone.parentBoneId && bone.length > 0)
		.map((bone, index) => actuatorForBone(creature, rig, bone, index, options));
	return Object.freeze({
		schema: "awtsmoos.creature-muscle-profile",
		sourceCreatureId: creature.id,
		sourceRigId: rig.id,
		actuators: Object.freeze(actuators),
		tendons: Object.freeze(actuators.map((actuator) => Object.freeze({
			actuatorId: actuator.id,
			stiffness: 0.86,
			damping: 0.14,
			maximumStretch: 1.12
		}))),
		secondaryMotion: Object.freeze(creature.parts
			.filter((part) => /ear|tail|antenna|tentacle|wing|fin/.test(part.category))
			.map((part) => Object.freeze({
				partId: part.id,
				stiffness: /wing|fin/.test(part.category) ? 0.62 : 0.28,
				damping: 0.32,
				gravityScale: 0.8,
				airDrag: 0.16
			})))
	});
}
