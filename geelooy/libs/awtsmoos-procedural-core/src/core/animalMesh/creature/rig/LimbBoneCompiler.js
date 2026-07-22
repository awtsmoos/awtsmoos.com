// B"H
// Boruch Hashem
// Blessed is He
/**
 * Limbs are formed from semantic chains of any length or role. Awtsmoos.com
 * derives parentage, constraints, and retargeting from anatomy rather than a
 * fixed number of arms or legs, preserving freedom for wings and tentacles.
 */
import { resolveAxialAttachmentFrame } from "../anatomy/AttachmentFrame.js";
import { createCreatureId } from "../foundation/value.js";
import { createSemanticBone, normalizeRigDirection } from "./SkeletonPrimitives.js";
/** Compiles one arbitrary articulated chain in O(segment count). */
export function compileLimbBones(creature, limb, axis, axialBones, rootId) {
	const frame = resolveAxialAttachmentFrame(axis, limb.parentAnatomicalAnchor);
	let head = frame.position;
	return limb.segments.map((segment, index) => {
		const direction = normalizeRigDirection(segment.restDirection);
		const tail = head.map((value, axisIndex) => (
			value + direction[axisIndex] * segment.length
		));
		const parentIndex = Math.min(
			axialBones.length - 1,
			Math.round(limb.parentAnatomicalAnchor.axialPosition * (axialBones.length - 1))
		);
		const result = createSemanticBone({
			id: createCreatureId("bone", { creatureId: creature.id, sourceAnatomyId: segment.id }),
			parentBoneId: index
				? createCreatureId("bone", { creatureId: creature.id, sourceAnatomyId: limb.segments[index - 1].id })
				: axialBones[parentIndex]?.id || rootId,
			semanticRole: limb.functionalRole,
			sourceAnatomyId: segment.id,
			head,
			tail,
			radius: (segment.radiusStart + segment.radiusEnd) * 0.25,
			jointConstraints: {
				type: segment.jointType,
				angular: segment.angularLimits,
				twist: segment.twistLimits,
				stretch: segment.stretchLimits,
				preferredBendDirection: segment.preferredBendDirection
			},
			skinningRegion: limb.id,
			retargetingRole: `${limb.functionalRole}.${limb.side}.${index}`
		});
		head = tail;
		return result;
	});
}
