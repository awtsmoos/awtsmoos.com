// B"H
// Boruch Hashem
// Blessed is He

import { CREATURE_VERSION, CREATURE_WORLD_TYPES } from "./contracts.js";
import { deriveCreatureContentHash, createSemanticId } from "./identity.js";
import { createRigBone } from "./rigBones.js";
import { createRigLineageReport } from "./rigLineage.js";
import { createSemanticAxialBones } from "./rigSynthesisAxial.js";
import {
	appendSemanticLimbBones,
	appendSemanticPartBones
} from "./rigSynthesisAppendages.js";
import { calculateSemanticCenterOfMass } from "./rigSynthesisMass.js";

/**
 * Synthesizes a non-humanoid Yetzirah rig from arbitrary Briah anatomy.
 * @param {Object} creature - Authoritative BriahCreature.
 * @param {Object|null} [previousRig=null] - Prior rig for lineage comparison.
 * @returns {Object} YetzirahRig with bones, controls, targets, and lineage.
 * @complexity O(s + l·g + p), where g is mean limb segment count.
 * @deterministic Always for equal Briah content.
 * @sideEffects None.
 */
export function synthesizeYetzirahRig(creature, previousRig = null) {
	const rootBone = createRigBone({
		semanticRole: "locomotion.root",
		sourceAnatomyId: creature.body.axialGraphId,
		translation: [0, 0, 0],
		length: 0,
		radius: 0.1,
		degreesOfFreedom: [
			"translate-x",
			"translate-y",
			"translate-z",
			"rotate"
		]
	});
	const axialBones = createSemanticAxialBones(creature, rootBone);
	const bones = [rootBone, ...axialBones];
	const targets = { contacts: [], ik: [], poles: [] };
	appendSemanticLimbBones(creature, axialBones, bones, targets);
	appendSemanticPartBones(creature, axialBones, bones);
	const rig = {
		id: createSemanticId("yetzirah-rig", creature.id),
		type: CREATURE_WORLD_TYPES.yetzirah,
		version: CREATURE_VERSION,
		sourceCreatureId: creature.id,
		sourceRevision: creature.revision,
		bones,
		constraints: bones.map((bone) => ({
			boneId: bone.id,
			...bone.jointConstraints
		})),
		attachmentFrames: creature.attachments.map((anchor) => ({
			anchorId: anchor.id,
			frame: anchor.transportedFrame
		})),
		controlGraph: {
			ikTargets: targets.ik,
			poleTargets: targets.poles,
			contactTargets: targets.contacts
		},
		skinningRecipe: {
			method: "segment-aware",
			maximumInfluences: 4,
			twistDistribution: true,
			dualQuaternionCompatible: true
		},
		gaitGraph: null,
		centerOfMass: calculateSemanticCenterOfMass(creature),
		locomotionSupportRoles: creature.limbs.filter(
			(limb) => limb.contactCapabilities.length
		).map((limb) => limb.id),
		retargetingMetadata: {
			roles: [...new Set(
				bones.map((bone) => bone.retargetingRole)
			)]
		},
		skeletonLineage: null,
		contentHash: ""
	};
	rig.contentHash = deriveCreatureContentHash(rig);
	rig.skeletonLineage = createRigLineageReport(previousRig, rig);
	return rig;
}
