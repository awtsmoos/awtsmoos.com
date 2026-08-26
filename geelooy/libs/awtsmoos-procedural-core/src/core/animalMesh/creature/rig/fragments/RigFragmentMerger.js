// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RigFragmentMerger.js
 * @description Flattens independently authored rig fragments into one final Yetzirah skeleton while preserving fragment ownership and local controls.
 * RESPONSIBILITY: map fragment bones into final ids, attach roots to chosen parents, merge controls/sockets, and emit local-to-final lookup tables.
 * NON-RESPONSIBILITY: this file does not create anatomy, derive creature-wide targets, evaluate clips, or decide where fragments should attach.
 * The Awtsmoos lets many local skeletons become one articulated body without erasing the truth of any limb;
 * Awtsmoos.com records every remap and owner, so unity gains power without collapsing modular revelation into something dim.
 */

import { mapRigFragmentBones } from "./RigFragmentBoneMapper.js";
import { mapRigFragmentControls } from "./RigFragmentControlMapper.js";

/**
 * Merges fragments into a flat bone collection suitable for existing renderer and skinning consumers.
 * @param {Array<object>} baseBones Existing axial/root bones.
 * @param {Array<object>} entries Fragment entries shaped as `{ fragment, spec }`.
 * @returns {object} Merged bones, controls, sockets, ownership, and per-fragment bone maps.
 */
export function mergeRigFragments(baseBones = [], entries = []) {
	const bones = [...baseBones];
	const contactTargets = [];
	const controlGraph = [];
	const sockets = [];
	const ownership = {};
	const boneMapByFragmentId = {};
	for (const entry of entries) {
		const mapped = mapRigFragmentBones(entry.fragment, entry.spec || {});
		const controls = mapRigFragmentControls(entry.fragment, mapped.boneIdMap);
		assertNoBoneCollisions(bones, mapped.bones, entry.fragment.id);
		bones.push(...mapped.bones);
		contactTargets.push(...controls.contactTargets);
		controlGraph.push(...controls.controlGraph);
		sockets.push(...controls.sockets);
		Object.assign(ownership, mapped.ownership);
		boneMapByFragmentId[entry.fragment.id] = mapped.boneIdMap;
	}
	return Object.freeze({
		boneIndexById: Object.freeze(Object.fromEntries(
			bones.map((bone, index) => [bone.id, index])
		)),
		boneMapByFragmentId: Object.freeze(boneMapByFragmentId),
		bones: Object.freeze(bones),
		constraints: Object.freeze(bones.map((bone) => ({
			boneId: bone.id,
			...bone.jointConstraints
		}))),
		contactTargets: Object.freeze(contactTargets),
		controlGraph: Object.freeze(controlGraph),
		fragmentOwnership: Object.freeze(ownership),
		sockets: Object.freeze(sockets)
	});
}

/** Prevents silent final-id collisions between independently authored fragments. */
function assertNoBoneCollisions(existingBones, incomingBones, fragmentId) {
	const existingIds = new Set(existingBones.map((bone) => bone.id));
	const collision = incomingBones.find((bone) => existingIds.has(bone.id));
	if (!collision) {
		return;
	}
	const error = new Error('B"H | Rig fragment bone id collision.');
	error.code = "CREATURE.RIG_FRAGMENT_BONE_COLLISION";
	error.details = {
		boneId: collision.id,
		fragmentId
	};
	throw error;
}
