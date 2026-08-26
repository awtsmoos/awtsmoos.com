//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SkeletonSynthesizer.js
 * @description Synthesizes the historical flat Yetzirah rig from composable local limb fragments while preserving axial and secondary-part compatibility.
 * RESPONSIBILITY: create the root/axial skeleton, merge detachable limb rig fragments in historical order, retain existing part bones and global targets, and expose additive fragment ownership/remap metadata.
 * NON-RESPONSIBILITY: this vessel does not generate flesh geometry, evaluate animation clocks, create limb anatomy, or force secondary biological parts into fragments before their own compilers are ready.
 * The Awtsmoos reveals one skeleton through many local vessels, yet no fragment is lost when the greater body becomes whole;
 * Awtsmoos.com keeps the renderer's flat Yetzirah covenant while revealing the hidden fragment graph through which each limb may still carry its own soul.
 */

import {
	createCreatureId,
	hashCreatureValue
} from "../foundation/value.js";
import { compileAxialBones } from "./AxialBoneCompiler.js";
import { compilePartBones } from "./PartBoneCompiler.js";
import { createRigLineageReport } from "./RigLineage.js";
import { deriveRigTargets } from "./RigTargets.js";
import { createSemanticBone } from "./SkeletonPrimitives.js";
import {
	createRigFragmentAssembly,
	mergeAxisLimbFragments
} from "./fragments/CreatureRigFragmentAssembly.js";

/**
 * Synthesizes a deterministic arbitrary-anatomy Yetzirah rig from composable fragments.
 * @param {object} creature Authoritative Briah creature document.
 * @param {object} [options={}] Previous-rig lineage and future synthesis controls.
 * @returns {object} Historical flat rig plus additive fragment graph metadata.
 */
export function synthesizeYetzirahRig(creature, options = {}) {
	const rootBone = createRootBone(creature.id);
	const assembly = createRigFragmentAssembly([rootBone]);
	for (const axis of creature.body.axes) {
		const axialBones = compileAxialBones(
			creature,
			axis,
			rootBone.id
		);
		assembly.bones.push(...axialBones);
		mergeAxisLimbFragments(
			assembly,
			creature,
			axis,
			axialBones,
			rootBone.id
		);
		assembly.bones.push(...compilePartBones(
			creature,
			axis,
			axialBones,
			rootBone.id
		));
	}
	return createFinalRig(creature, options, assembly);
}

/** Creates the stable historical root bone. */
function createRootBone(creatureId) {
	return createSemanticBone({
		degreesOfFreedom: [],
		head: [0, 0, 0],
		id: createCreatureId("bone", {
			creatureId,
			role: "root"
		}),
		jointConstraints: { type: "fixed" },
		parentBoneId: null,
		radius: 0.15,
		semanticRole: "root",
		skinningRegion: "root",
		sourceAnatomyId: creatureId,
		tail: [0, 0, 0.2]
	});
}

/** Builds the public rig contract while exposing fragment-native metadata as an additive superset. */
function createFinalRig(creature, options, assembly) {
	const bones = assembly.bones;
	const targets = deriveRigTargets(creature);
	const lineage = createRigLineageReport(options.previousRig, bones);
	const content = historicalHashContent(creature, bones, targets);
	return Object.freeze({
		attachmentFrames: Object.freeze([]),
		boneIndexById: Object.freeze(Object.fromEntries(
			bones.map((bone, index) => [bone.id, index])
		)),
		boneMapByFragmentId: Object.freeze({ ...assembly.boneMapByFragmentId }),
		bones: Object.freeze(bones),
		centerOfMass: Object.freeze(estimateCenterOfMass(creature)),
		constraints: Object.freeze(bones.map((bone) => ({
			boneId: bone.id,
			...bone.jointConstraints
		}))),
		contactTargets: Object.freeze(targets.contactTargets),
		contentHash: hashCreatureValue(content),
		controlGraph: Object.freeze(targets.controlGraph),
		deterministic: true,
		fragmentContactTargets: Object.freeze([...assembly.contactTargets]),
		fragmentControlGraph: Object.freeze([...assembly.controlGraph]),
		fragmentOwnership: Object.freeze({ ...assembly.ownership }),
		fragmentSockets: Object.freeze([...assembly.sockets]),
		id: createCreatureId("yetzirah-rig", { creatureId: creature.id }),
		retargetingMetadata: Object.freeze({
			semanticRoles: [...new Set(bones.map((bone) => bone.retargetingRole))]
		}),
		rigFragments: Object.freeze([...assembly.fragments]),
		skeletonLineage: lineage,
		sourceCreatureHash: creature.contentHash,
		type: "yetzirah-rig",
		version: "1.0.0"
	});
}

/** Preserves the historical content-hash inputs so modular authoring does not cause artificial identity drift. */
function historicalHashContent(creature, bones, targets) {
	return {
		bones,
		contactTargets: targets.contactTargets,
		controlGraph: targets.controlGraph,
		creatureId: creature.id,
		sourceContentHash: creature.contentHash
	};
}

/** Estimates center of mass from weighted axial sections without assuming a humanoid body plan. */
function estimateCenterOfMass(creature) {
	let weighted = [0, 0, 0];
	let totalMass = 0;
	for (const axis of creature.body.axes) {
		for (const section of axis.sections) {
			const mass = section.massContribution;
			weighted = weighted.map((value, index) => {
				return value + section.position[index] * mass;
			});
			totalMass += mass;
		}
	}
	return totalMass
		? weighted.map((value) => value / totalMass)
		: [0, 0, 0];
}
