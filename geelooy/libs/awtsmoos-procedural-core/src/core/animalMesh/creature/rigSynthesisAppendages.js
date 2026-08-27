// B"H
// Boruch Hashem
// Blessed is He
import { createSemanticId } from "./identity.js";
import {
	createRigBone,
	degreesOfFreedomForJoint
} from "./rigBones.js";
import { resolveRigAnchorBone } from "./rigSynthesisAxial.js";

/** Adds arbitrary articulated limb bones and semantic targets. */
export function appendSemanticLimbBones(
	creature,
	axialBones,
	bones,
	targets
) {
	for (const limb of creature.limbs) {
		let parentBoneId = resolveRigAnchorBone(
			creature,
			axialBones,
			limb.parentAnatomicalAnchor
		);
		limb.segments.forEach((segment, index) => {
			const joint = limb.jointSequence[index] || {};
			const bone = createRigBone({
				parentBoneId,
				semanticRole: `${limb.functionalRole}.segment`,
				sourceAnatomyId: segment.id,
				length: segment.length,
				radius: (segment.radiusStart + segment.radiusEnd) * 0.5,
				jointConstraints: {
					type: segment.jointType,
					angularLimits: segment.angularLimits,
					twistLimits: segment.twistLimits,
					stretchLimits: segment.stretchLimits,
					preferredBendDirection: joint.preferredBendDirection
						|| segment.preferredBendDirection
				},
				degreesOfFreedom: degreesOfFreedomForJoint(segment.jointType),
				skinningRegion: `${limb.id}:${segment.id}`,
				retargetingRole: limb.functionalRole,
				collisionExclusions: limb.collisionExclusions
			});
			bones.push(bone);
			parentBoneId = bone.id;
		});
		if (limb.contactCapabilities.length) {
			targets.contacts.push({
				id: createSemanticId("contact", limb.id),
				limbId: limb.id,
				boneId: parentBoneId,
				capabilities: [...limb.contactCapabilities],
				importance: limb.locomotionImportance
			});
		}
		targets.ik.push({
			id: createSemanticId("ik", limb.id),
			limbId: limb.id,
			boneId: parentBoneId,
			role: limb.manipulationCapabilities.length
				? "manipulation"
				: "locomotion"
		});
		if (limb.segments.length > 1) {
			targets.poles.push({
				id: createSemanticId("pole", limb.id),
				limbId: limb.id,
				preferredDirection: [
					...limb.segments[1].preferredBendDirection
				]
			});
		}
	}
}

const CATEGORY_ROLES = Object.freeze({
	mouth: "facial.jaw",
	eye: "sensory.eye",
	"eye-stalk": "sensory.eye-stalk",
	ear: "sensory.ear",
	antenna: "sensory.antenna",
	wing: "propulsion.wing",
	fin: "propulsion.fin",
	tail: "secondary.tail",
	tentacle: "manipulation.tentacle"
});

/** Adds facial, sensory, propulsion, and secondary-motion part bones. */
export function appendSemanticPartBones(creature, axialBones, bones) {
	for (const part of creature.parts) {
		const semanticRole = part.rigContribution?.semanticRole
			|| CATEGORY_ROLES[part.category];
		if (!semanticRole) {
			continue;
		}
		const anchor = creature.attachments.find(
			(candidate) => candidate.partId === part.id
		);
		bones.push(createRigBone({
			parentBoneId: resolveRigAnchorBone(
				creature,
				axialBones,
				anchor?.bodyRegion || "torso"
			),
			semanticRole,
			sourceAnatomyId: part.id,
			length: Number(part.parameters.length || 0.2),
			radius: Number(part.parameters.radius || 0.08),
			jointConstraints: part.rigContribution?.jointConstraints || {
				type: semanticRole === "facial.jaw" ? "hinge" : "ball",
				angularLimits: { minimum: -0.7, maximum: 0.7 }
			},
			degreesOfFreedom: semanticRole === "facial.jaw"
				? ["open"]
				: ["aim-x", "aim-y"],
			retargetingRole: semanticRole
		}));
	}
}
