// B"H
// Boruch Hashem
// Blessed is He

import { createRigBone } from "./rigBones.js";

/** Resolves a semantic anatomical anchor to its surviving axial bone. */
export function resolveRigAnchorBone(creature, axialBones, anchor) {
	const sections = creature.body.sections;
	if (sections.some((section) => section.id === anchor)) {
		return axialBones.find(
			(bone) => bone.sourceAnatomyId === anchor
		)?.id;
	}
	if (/anterior|front|head|upper/.test(anchor)) {
		return axialBones.at(-1)?.id;
	}
	if (/posterior|rear|tail|lower/.test(anchor)) {
		return axialBones[0]?.id;
	}
	return axialBones[Math.floor(axialBones.length / 2)]?.id;
}

/** Compiles one stable axial spine bone per semantic body section. */
export function createSemanticAxialBones(creature, rootBone) {
	const bones = [];
	let parentBoneId = rootBone.id;
	for (const section of creature.body.sections) {
		const bend = section.localDeformationLimits.bend;
		const bone = createRigBone({
			parentBoneId,
			semanticRole: "axial.spine",
			sourceAnatomyId: section.id,
			translation: section.position,
			length: Math.max(section.ellipticalRadius[0], 0.05),
			radius: Math.min(...section.ellipticalRadius) * 0.25,
			jointConstraints: {
				type: "ball",
				angularLimits: { minimum: -bend, maximum: bend },
				twistLimits: { minimum: -0.6, maximum: 0.6 },
				stretchLimits: {
					minimum: 0.9,
					maximum: section.localDeformationLimits.stretch
				}
			},
			degreesOfFreedom: ["swing-x", "swing-y", "twist", "stretch"],
			retargetingRole: "spine"
		});
		bones.push(bone);
		parentBoneId = bone.id;
	}
	return bones;
}
