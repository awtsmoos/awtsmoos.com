// B"H
// Boruch Hashem
// Blessed is He

import { CREATURE_VERSION, CREATURE_WORLD_TYPES } from "./contracts.js";
import { deriveCreatureContentHash, createSemanticId } from "./identity.js";
import { createRigBone, degreesOfFreedomForJoint } from "./rigBones.js";
import { createRigLineageReport } from "./rigLineage.js";

function resolveAnchorBone(creature, axialBones, anchor) {
	const sections = creature.body.sections;
	if (sections.some((section) => section.id === anchor)) {
		return axialBones.find((bone) => bone.sourceAnatomyId === anchor)?.id;
	}
	if (/anterior|front|head|upper/.test(anchor)) {
		return axialBones.at(-1)?.id;
	}
	if (/posterior|rear|tail|lower/.test(anchor)) {
		return axialBones[0]?.id;
	}
	return axialBones[Math.floor(axialBones.length / 2)]?.id;
}

function createAxialBones(creature, rootBone) {
	const bones = [];
	let parentBoneId = rootBone.id;
	for (const section of creature.body.sections) {
		const bone = createRigBone({
			parentBoneId,
			semanticRole: "axial.spine",
			sourceAnatomyId: section.id,
			translation: section.position,
			length: Math.max(section.ellipticalRadius[0], 0.05),
			radius: Math.min(...section.ellipticalRadius) * 0.25,
			jointConstraints: { type: "ball", angularLimits: { minimum: -section.localDeformationLimits.bend, maximum: section.localDeformationLimits.bend }, twistLimits: { minimum: -0.6, maximum: 0.6 }, stretchLimits: { minimum: 0.9, maximum: section.localDeformationLimits.stretch } },
			degreesOfFreedom: ["swing-x", "swing-y", "twist", "stretch"],
			retargetingRole: "spine"
		});
		bones.push(bone);
		parentBoneId = bone.id;
	}
	return bones;
}

function appendLimbBones(creature, axialBones, bones, targets) {
	for (const limb of creature.limbs) {
		let parentBoneId = resolveAnchorBone(creature, axialBones, limb.parentAnatomicalAnchor);
		limb.segments.forEach((segment, index) => {
			const joint = limb.jointSequence[index] || {};
			const bone = createRigBone({
				parentBoneId,
				semanticRole: `${limb.functionalRole}.segment`,
				sourceAnatomyId: segment.id,
				length: segment.length,
				radius: (segment.radiusStart + segment.radiusEnd) * 0.5,
				jointConstraints: { type: segment.jointType, angularLimits: segment.angularLimits, twistLimits: segment.twistLimits, stretchLimits: segment.stretchLimits, preferredBendDirection: joint.preferredBendDirection || segment.preferredBendDirection },
				degreesOfFreedom: degreesOfFreedomForJoint(segment.jointType),
				skinningRegion: `${limb.id}:${segment.id}`,
				retargetingRole: limb.functionalRole,
				collisionExclusions: limb.collisionExclusions
			});
			bones.push(bone);
			parentBoneId = bone.id;
		});
		const endpointBoneId = parentBoneId;
		if (limb.contactCapabilities.length) {
			targets.contacts.push({ id: createSemanticId("contact", limb.id), limbId: limb.id, boneId: endpointBoneId, capabilities: [...limb.contactCapabilities], importance: limb.locomotionImportance });
		}
		targets.ik.push({ id: createSemanticId("ik", limb.id), limbId: limb.id, boneId: endpointBoneId, role: limb.manipulationCapabilities.length ? "manipulation" : "locomotion" });
		if (limb.segments.length > 1) {
			targets.poles.push({ id: createSemanticId("pole", limb.id), limbId: limb.id, preferredDirection: [...limb.segments[1].preferredBendDirection] });
		}
	}
}

function appendPartBones(creature, axialBones, bones) {
	const categoryRoles = {
		mouth: "facial.jaw",
		eye: "sensory.eye",
		"eye-stalk": "sensory.eye-stalk",
		ear: "sensory.ear",
		antenna: "sensory.antenna",
		wing: "propulsion.wing",
		fin: "propulsion.fin",
		tail: "secondary.tail",
		tentacle: "manipulation.tentacle"
	};
	for (const part of creature.parts) {
		const semanticRole = part.rigContribution?.semanticRole || categoryRoles[part.category];
		if (!semanticRole) {
			continue;
		}
		const anchor = creature.attachments.find((candidate) => candidate.partId === part.id);
		bones.push(createRigBone({
			parentBoneId: resolveAnchorBone(creature, axialBones, anchor?.bodyRegion || "torso"),
			semanticRole,
			sourceAnatomyId: part.id,
			length: Number(part.parameters.length || 0.2),
			radius: Number(part.parameters.radius || 0.08),
			jointConstraints: part.rigContribution?.jointConstraints || { type: semanticRole === "facial.jaw" ? "hinge" : "ball", angularLimits: { minimum: -0.7, maximum: 0.7 } },
			degreesOfFreedom: semanticRole === "facial.jaw" ? ["open"] : ["aim-x", "aim-y"],
			retargetingRole: semanticRole
		}));
	}
}

function calculateCenterOfMass(creature) {
	let totalMass = 0;
	const weighted = [0, 0, 0];
	for (const section of creature.body.sections) {
		totalMass += section.massContribution;
		section.position.forEach((value, index) => {
			weighted[index] += value * section.massContribution;
		});
	}
	return totalMass ? weighted.map((value) => value / totalMass) : [0, 0, 0];
}

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
	const rootBone = createRigBone({ semanticRole: "locomotion.root", sourceAnatomyId: creature.body.axialGraphId, translation: [0, 0, 0], length: 0, radius: 0.1, degreesOfFreedom: ["translate-x", "translate-y", "translate-z", "rotate"] });
	const axialBones = createAxialBones(creature, rootBone);
	const bones = [rootBone, ...axialBones];
	const targets = { contacts: [], ik: [], poles: [] };
	appendLimbBones(creature, axialBones, bones, targets);
	appendPartBones(creature, axialBones, bones);
	const rig = {
		id: createSemanticId("yetzirah-rig", creature.id),
		type: CREATURE_WORLD_TYPES.yetzirah,
		version: CREATURE_VERSION,
		sourceCreatureId: creature.id,
		sourceRevision: creature.revision,
		bones,
		constraints: bones.map((bone) => ({ boneId: bone.id, ...bone.jointConstraints })),
		attachmentFrames: creature.attachments.map((anchor) => ({ anchorId: anchor.id, frame: anchor.transportedFrame })),
		controlGraph: { ikTargets: targets.ik, poleTargets: targets.poles, contactTargets: targets.contacts },
		skinningRecipe: { method: "segment-aware", maximumInfluences: 4, twistDistribution: true, dualQuaternionCompatible: true },
		gaitGraph: null,
		centerOfMass: calculateCenterOfMass(creature),
		locomotionSupportRoles: creature.limbs.filter((limb) => limb.contactCapabilities.length).map((limb) => limb.id),
		retargetingMetadata: { roles: [...new Set(bones.map((bone) => bone.retargetingRole))] },
		skeletonLineage: null,
		contentHash: ""
	};
	rig.contentHash = deriveCreatureContentHash(rig);
	rig.skeletonLineage = createRigLineageReport(previousRig, rig);
	return rig;
}
