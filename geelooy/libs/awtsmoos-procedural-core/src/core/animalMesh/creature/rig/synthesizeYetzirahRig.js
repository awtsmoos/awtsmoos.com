// B"H
// Boruch Hashem
// Blessed is He
/**
 * Yetzirah forms a skeleton from actual Briah anatomy. The Awtsmoos assumes no
 * humanoid silhouette; Awtsmoos.com may form serpents, radial walkers, wings,
 * fins, sensory stalks, multiple heads, or creatures with no traditional limbs.
 */
import { compileAxialBones } from "./compileAxialBones.js";
import { compileLimbBones } from "./compileLimbBones.js";
import { createYetzirahBone } from "./boneFactory.js";
import { deriveRigTargets } from "./deriveRigTargets.js";
import { deriveRigLineage } from "./deriveRigLineage.js";
import { calculateCreatureCenterOfMass } from "./calculateCreatureCenterOfMass.js";
import {
	addVector,
	creatureContentHash,
	creatureStableId
} from "../shared/creatureValue.js";

function addPartControls(creature, bones, sectionBoneIds) {
	const categories = new Set(["mouth", "eye", "ear", "antenna", "jaw"]);
	for (const part of creature.parts) {
		if (!categories.has(part.semanticCategory)) {
			continue;
		}
		const attachment = creature.attachments.find(
			(entry) => entry.sourceId === part.id
		);
		const section = creature.body.sections.find(
			(entry) => entry.id === attachment?.anchor?.axialSectionId
		) || creature.body.sections.at(-1);
		const semanticRole = part.semanticCategory === "mouth"
			? "facial.jaw"
			: `sensory.${part.semanticCategory}`;
		bones.push(createYetzirahBone(
			part.id,
			semanticRole,
			sectionBoneIds.get(section?.id) || bones.at(-1)?.id || null,
			section?.position || [0, 0, 0],
			addVector(section?.position || [0, 0, 0], [0, 0.1, 0]),
			{
				radius: 0.03,
				degreesOfFreedom: ["rotateX", "rotateY", "rotateZ"]
			}
		));
	}
}

/**
 * Synthesizes a deterministic arbitrary-anatomy Yetzirah rig.
 * Stable-reference behavior: source-derived IDs survive logical continuity.
 */
export function synthesizeYetzirahRig(creature, options = {}) {
	const axial = compileAxialBones(creature);
	const bones = [...axial.bones];
	for (const limb of creature.limbs) {
		bones.push(...compileLimbBones(
			creature,
			limb,
			axial.sectionBoneIds
		));
	}
	addPartControls(creature, bones, axial.sectionBoneIds);
	const targets = deriveRigTargets(creature, bones);
	const rig = {
		id: creatureStableId("yetzirah.rig", { creatureId: creature.id }),
		type: "yetzirah-rig",
		version: "1.0.0",
		sourceBriahId: creature.id,
		sourceBriahHash: creature.contentHash,
		bones,
		constraints: bones.map((bone) => ({
			boneId: bone.id,
			...bone.jointConstraints
		})),
		attachmentFrames: creature.attachments.map((entry) => ({
			attachmentId: entry.id,
			anchorId: entry.anchorId,
			orientationRule: entry.orientationRule
		})),
		controlGraph: {
			ikTargets: targets.ikTargets,
			poleTargets: targets.poleTargets,
			facialControls: bones.filter(
				(bone) => bone.semanticRole.startsWith("facial")
					|| bone.semanticRole.startsWith("sensory")
			).map((bone) => bone.id)
		},
		contactTargets: targets.contactTargets,
		twistDistribution: bones.filter(
			(bone) => bone.length > bone.radius * 6
		).map((bone) => ({
			boneId: bone.id,
			policy: "distributed"
		})),
		centerOfMass: calculateCreatureCenterOfMass(creature),
		locomotionSupportRoles: creature.limbs.filter(
			(limb) => limb.contactCapabilities.includes("ground.support")
		).map((limb) => limb.id),
		retargetingMetadata: {
			semanticRoles: [...new Set(
				bones.map((bone) => bone.retargetingRole)
			)]
		},
		lineage: deriveRigLineage(options.previousRig, bones)
	};
	rig.contentHash = creatureContentHash(rig);
	return Object.freeze(rig);
}
