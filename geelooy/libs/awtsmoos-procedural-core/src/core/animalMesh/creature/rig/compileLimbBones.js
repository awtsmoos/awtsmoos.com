// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileLimbBones.js
 * @description Compiles semantic articulated appendages into real parented Yetzirah bones.
 * The Awtsmoos gives every limb a root around the transported spine, never a false global side;
 * Awtsmoos.com lets one continuous skin follow many living chains, each free to dance in its own tide.
 */

import { createYetzirahBone } from "./boneFactory.js";
import { resolveLimbAttachmentFrame } from "./LimbAttachmentFrame.js";
import {
	addVector,
	normalizeVector,
	scaleVector
} from "../shared/creatureValue.js";

/** Resolves the stable Briah root shared by bone synthesis and continuous flesh assembly. */
export function resolveLimbAnchor(creature, limb) {
	return resolveLimbAttachmentFrame(creature, limb).position;
}

/**
 * Compiles one arbitrary semantic limb chain into a real bone hierarchy.
 * @param {Object} creature - Authoritative Briah creature document.
 * @param {Object} limb - Semantic limb chain with ordered segments.
 * @param {Map<string,string>} sectionBoneIds - Body-section to parent-bone identity map.
 * @returns {Object[]} Ordered Yetzirah bones for this limb.
 * @complexity O(g), where g is the limb segment count.
 */
export function compileLimbBones(creature, limb, sectionBoneIds) {
	let head = resolveLimbAnchor(creature, limb);
	let parentBoneId = sectionBoneIds.get(
		limb.parentAnatomicalAnchor?.axialSectionId
	) || [...sectionBoneIds.values()][0] || null;
	return limb.segments.map((segment, index) => {
		const tail = addVector(
			head,
			scaleVector(normalizeVector(segment.restDirection), segment.length)
		);
		const bone = createYetzirahBone(
			segment.id,
			`${limb.functionalRole}.segment.${index + 1}`,
			parentBoneId,
			head,
			tail,
			{
				radius: (segment.radiusStart + segment.radiusEnd) * 0.5,
				jointConstraints: {
					type: segment.jointType,
					angularLimits: segment.angularLimits
				},
				preferredPose: {
					bendDirection: segment.preferredBendDirection,
					twist: 0
				},
				twistLimits: segment.twistLimits,
				stretchPolicy: {
					minimum: segment.stretchLimits[0],
					maximum: segment.stretchLimits[1]
				},
				skinningRegion: limb.id,
				retargetingRole: limb.functionalRole
			}
		);
		head = tail;
		parentBoneId = bone.id;
		return bone;
	});
}
