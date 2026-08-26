//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureLimbFragmentEntries.js
 * @description Adapts detachable limb rig fragments into creature-space merge entries without changing the historical limb attachment semantics.
 * RESPONSIBILITY: resolve each limb's axial attachment position, choose its final parent axial bone, compile the limb locally, and describe the translation that grafts it into the creature.
 * NON-RESPONSIBILITY: this vessel does not flatten fragments, create axial bones, evaluate animation, or alter local joint constraints.
 * The Awtsmoos, Atzmus beyond form, lets a leg exist alone and then enter the greater body without forgetting its local truth;
 * Awtsmoos.com keeps the graft explicit: local bone-song remains itself while Yesod carries its root into the living creature's proof.
 */

import { resolveAxialAttachmentFrame } from "../../anatomy/AttachmentFrame.js";
import { compileLimbRigFragment } from "./LimbRigFragmentCompiler.js";

/**
 * Creates merge-ready entries for every arbitrary creature limb.
 * @param {object} creature
 * 	Authoritative Briah creature document containing semantic limbs and stable creature identity.
 * @param {object} axis
 * 	Resolved axial anatomy used by the historical attachment-frame contract.
 * @param {Array<object>} axialBones
 * 	Already compiled creature axial bones in proximal-to-distal order.
 * @param {string} rootBoneId
 * 	Fallback final parent when no axial bone is available.
 * @returns {Array<object>}
 * 	Entries shaped as `{ fragment, limb, spec }` for `mergeRigFragments` and later animation-fragment compilation.
 */
export function createCreatureLimbFragmentEntries(
	creature,
	axis,
	axialBones,
	rootBoneId
) {
	return creature.limbs.map((limb) => {
		const frame = resolveAxialAttachmentFrame(
			axis,
			limb.parentAnatomicalAnchor
		);
		const parentIndex = axialParentIndex(
			limb,
			axialBones.length
		);
		const fragment = compileLimbRigFragment(limb, {
			fragmentId: `limb-fragment:${limb.id}`,
			origin: [0, 0, 0]
		});
		return Object.freeze({
			fragment,
			limb,
			spec: Object.freeze({
				creatureId: creature.id,
				parentBoneId: axialBones[parentIndex]?.id || rootBoneId,
				translation: Object.freeze([...frame.position])
			})
		});
	});
}

/** Resolves the same bounded axial parent index used by the historical limb compiler. */
function axialParentIndex(limb, axialBoneCount) {
	if (axialBoneCount <= 0) {
		return 0;
	}
	const rawPosition = Number(
		limb.parentAnatomicalAnchor?.axialPosition
	);
	const normalizedPosition = Number.isFinite(rawPosition)
		? Math.max(0, Math.min(1, rawPosition))
		: 0;
	return Math.min(
		axialBoneCount - 1,
		Math.round(normalizedPosition * (axialBoneCount - 1))
	);
}
