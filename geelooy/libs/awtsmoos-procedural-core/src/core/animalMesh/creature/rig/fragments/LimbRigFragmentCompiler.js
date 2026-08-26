// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LimbRigFragmentCompiler.js
 * @description Compiles one semantic limb into a complete detachable local Yetzirah rig fragment.
 * RESPONSIBILITY: create a local bone chain from the limb's own segment anatomy, then attach contact, IK, pole, socket, and retarget metadata.
 * NON-RESPONSIBILITY: this file does not need a torso, resolve creature-space attachment frames, merge fragments, or evaluate animation time.
 * The Awtsmoos lets a single leg stand as a complete vessel before any body gathers around its root;
 * Awtsmoos.com gives every segment bone and control a local identity so the same limb may later merge without losing its truth.
 */

import { createCreatureId } from "../../foundation/value.js";
import {
	createSemanticBone,
	normalizeRigDirection
} from "../SkeletonPrimitives.js";
import { createRigFragment } from "./RigFragment.js";
import { createLimbRigControls } from "./LimbRigControls.js";

/**
 * Compiles one limb independently from every larger creature skeleton.
 * @param {object} limb Semantic limb anatomy containing ordered segments.
 * @param {object} options Local origin and stable fragment identity overrides.
 * @returns {object} Complete detachable rig fragment.
 */
export function compileLimbRigFragment(limb, options = {}) {
	const fragmentId = String(options.fragmentId || `limb-fragment:${limb.id}`);
	const bones = createLocalBones(limb, fragmentId, options.origin || [0, 0, 0]);
	const controls = createLimbRigControls(limb, bones);
	return createRigFragment({
		bones,
		contactTargets: controls.contactTargets,
		controlGraph: controls.controlGraph,
		id: fragmentId,
		metadata: {
			functionalRole: limb.functionalRole,
			segmentIds: limb.segments.map((segment) => segment.id),
			side: limb.side || "center"
		},
		rootBoneIds: bones.length ? [bones[0].id] : [],
		sockets: controls.sockets,
		sourceAnatomyId: limb.id
	});
}

/** Creates the local proximal-to-distal bone chain from semantic segment dimensions. */
function createLocalBones(limb, fragmentId, origin) {
	let head = normalizedPoint(origin);
	return limb.segments.map((segment, index) => {
		const direction = normalizeRigDirection(segment.restDirection || [0, -1, 0]);
		const length = positive(segment.length, 0.01);
		const tail = head.map((value, axis) => value + direction[axis] * length);
		const id = localBoneId(fragmentId, segment.id);
		const bone = createSemanticBone({
			id,
			jointConstraints: {
				angular: segment.angularLimits,
				preferredBendDirection: segment.preferredBendDirection,
				stretch: segment.stretchLimits,
				twist: segment.twistLimits,
				type: segment.jointType
			},
			parentBoneId: index
				? localBoneId(fragmentId, limb.segments[index - 1].id)
				: null,
			radius: (positive(segment.radiusStart, 0.02) + positive(segment.radiusEnd, 0.015)) * 0.25,
			retargetingRole: `${limb.functionalRole}.${limb.side || "center"}.${index}`,
			semanticRole: limb.functionalRole,
			skinningRegion: limb.id,
			sourceAnatomyId: segment.id,
			head,
			tail
		});
		head = tail;
		return bone;
	});
}

/** Creates a stable local bone identity that remains remappable when fragments merge. */
function localBoneId(fragmentId, sourceAnatomyId) {
	return createCreatureId("fragment-bone", {
		fragmentId,
		sourceAnatomyId
	});
}

/** Normalizes one local origin into three finite coordinates. */
function normalizedPoint(value) {
	return [0, 1, 2].map((axis) => {
		const number = Number(value?.[axis]);
		return Number.isFinite(number) ? number : 0;
	});
}

/** Returns a positive finite number or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
