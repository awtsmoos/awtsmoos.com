// B"H
// Boruch Hashem
// Blessed is He
/**
 * Mouths, eyes, antennae, ears, and secondary appendages may contribute formed
 * controls without becoming authoritative geometry. Awtsmoos.com derives each
 * control bone from its semantic part identity and transported attachment frame.
 */
import { resolveAxialAttachmentFrame } from "../anatomy/AttachmentFrame.js";
import { createCreatureId } from "../foundation/value.js";
import { createSemanticBone } from "./SkeletonPrimitives.js";
function contributionRole(part) {
	if (part.rigContribution === "jaw") return "face.jaw";
	if (part.rigContribution === "eye-control") return "sense.eye";
	if (part.category === "ear") return "sense.ear";
	if (part.category === "antenna") return "sense.antenna";
	return part.rigContribution ? `secondary.${part.rigContribution}` : null;
}
/** Compiles semantic part control bones in O(part count). */
export function compilePartBones(creature, axis, parentBones, rootId) {
	return creature.parts.flatMap(part => {
		const semanticRole = contributionRole(part);
		if (!semanticRole || part.attachment.limbSegmentId) return [];
		const frame = resolveAxialAttachmentFrame(axis, part.attachment);
		const scale = part.parameters.scale || [0.1, 0.1, 0.1];
		const tail = frame.position.map((value, index) => (
			value + frame.tangent[index] * Math.max(...scale)
		));
		const axialIndex = Math.min(
			parentBones.length - 1,
			Math.round(part.attachment.axialPosition * (parentBones.length - 1))
		);
		return [createSemanticBone({
			id: createCreatureId("bone", { creatureId: creature.id, sourceAnatomyId: part.id }),
			parentBoneId: parentBones[axialIndex]?.id || rootId,
			semanticRole,
			sourceAnatomyId: part.id,
			head: frame.position,
			tail,
			radius: Math.max(0.01, Math.min(...scale) * 0.25),
			jointConstraints: {
				type: semanticRole === "face.jaw" ? "hinge" : "ball",
				angular: semanticRole === "face.jaw"
					? { minimum: 0, maximum: 45 }
					: { minimum: -50, maximum: 50 },
				twist: { minimum: -20, maximum: 20 },
				stretch: { minimum: 1, maximum: 1 }
			},
			skinningRegion: part.materialRegion,
			retargetingRole: semanticRole
		})];
	});
}
