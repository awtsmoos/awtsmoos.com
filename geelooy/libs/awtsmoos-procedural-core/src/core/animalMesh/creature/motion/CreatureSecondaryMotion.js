// B"H
// Boruch Hashem
// Blessed is He
/**
 * Secondary life is derived from semantic formation, never painted onto bone slots.
 * Awtsmoos.com routes arbitrary axial, sensory, soft, propulsion, and contact
 * roles into stable controls while Briah anatomy remains entirely unchanged.
 */

import {
	createBreathingChannel,
	createContactCompressionChannel,
	createEyeMicroMotionChannel,
	createPropulsionFlexChannel,
	createSoftFollowThroughChannel
} from "./CreatureSecondaryMotionChannels.js";

function appendBoneChannels(controls, bone, contactBoneIds, time, input) {
	const role = bone.semanticRole;
	if (role === "axial.spine") {
		controls.push(createBreathingChannel(bone, time, input));
	}
	if (/^sensory\.eye/.test(role)) {
		controls.push(createEyeMicroMotionChannel(bone, time, input));
	}
	if (/^(secondary\.|sensory\.(ear|antenna)|manipulation\.tentacle)/.test(role)) {
		controls.push(createSoftFollowThroughChannel(bone, time, input));
	}
	if (/^propulsion\.(wing|fin)/.test(role)) {
		controls.push(createPropulsionFlexChannel(bone, time, input));
	}
	if (contactBoneIds.has(bone.id)) {
		controls.push(createContactCompressionChannel(bone, input));
	}
}

/**
 * Evaluates semantic breathing, gaze, soft motion, propulsion, and contact controls.
 * @returns {Object} Immutable secondary-motion artifact keyed by stable bone IDs.
 * @complexity O(bones + contacts).
 * @deterministic Always for equal rig, time, and options.
 * @sideEffects None.
 * @stableReferenceBehavior Controls follow Yetzirah bone and source-anatomy IDs.
 */
export function evaluateCreatureSecondaryMotion(creature, rig, input = {}) {
	const time = Number(input.time ?? 0);
	const contactBoneIds = new Set(
		(rig.controlGraph?.contactTargets ?? []).map(target => target.boneId)
	);
	const controls = [];
	for (const bone of rig.bones) {
		appendBoneChannels(controls, bone, contactBoneIds, time, input);
	}
	return Object.freeze({
		type: "creature-secondary-motion",
		version: "1.0.0",
		creatureId: creature.id,
		rigId: rig.id,
		time,
		controls: Object.freeze(controls),
		diagnostics: Object.freeze({
			controlCount: controls.length,
			semanticRoles: Object.freeze([...new Set(controls.map(item => item.role))]),
			constraintsAuthoritativeInRig: true,
			briahMutated: false
		})
	});
}
