// B"H
// Boruch Hashem
// Blessed is He
/**
 * Yetzirah forms a skeleton from whatever anatomy Briah reveals: two legs,
 * twelve legs, wings, fins, branches, tentacles, or no legs at all. No humanoid
 * idol is assumed; Awtsmoos.com derives bones from semantic source identities.
 */
import { createCreatureId, hashCreatureValue } from "../foundation/value.js";
import { compileAxialBones } from "./AxialBoneCompiler.js";
import { compileLimbBones } from "./LimbBoneCompiler.js";
import { compilePartBones } from "./PartBoneCompiler.js";
import { createRigLineageReport } from "./RigLineage.js";
import { deriveRigTargets } from "./RigTargets.js";
import { createSemanticBone } from "./SkeletonPrimitives.js";
function estimateCenterOfMass(creature) {
	let weighted = [0, 0, 0];
	let totalMass = 0;
	for (const axis of creature.body.axes) {
		for (const section of axis.sections) {
			const mass = section.massContribution;
			weighted = weighted.map((value, index) => value + section.position[index] * mass);
			totalMass += mass;
		}
	}
	return totalMass ? weighted.map(value => value / totalMass) : [0, 0, 0];
}
/** Synthesizes a deterministic arbitrary-anatomy YetzirahRig in O(anatomy). */
export function synthesizeYetzirahRig(creature, options = {}) {
	const rootId = createCreatureId("bone", { creatureId: creature.id, role: "root" });
	const rootBone = createSemanticBone({
		id: rootId,
		parentBoneId: null,
		semanticRole: "root",
		sourceAnatomyId: creature.id,
		head: [0, 0, 0],
		tail: [0, 0, 0.2],
		radius: 0.15,
		jointConstraints: { type: "fixed" },
		skinningRegion: "root",
		degreesOfFreedom: []
	});
	const bones = [rootBone];
	for (const axis of creature.body.axes) {
		const axialBones = compileAxialBones(creature, axis, rootId);
		bones.push(...axialBones);
		const attachedLimbs = creature.limbs.filter(limb => (
			!limb.parentAnatomicalAnchor.axisId || limb.parentAnatomicalAnchor.axisId === axis.id
		));
		for (const limb of attachedLimbs) {
			bones.push(...compileLimbBones(creature, limb, axis, axialBones, rootId));
		}
		bones.push(...compilePartBones(creature, axis, axialBones, rootId));
	}
	const targets = deriveRigTargets(creature);
	const lineage = createRigLineageReport(options.previousRig, bones);
	const content = {
		creatureId: creature.id,
		sourceContentHash: creature.contentHash,
		bones,
		controlGraph: targets.controlGraph,
		contactTargets: targets.contactTargets
	};
	return Object.freeze({
		id: createCreatureId("yetzirah-rig", { creatureId: creature.id }),
		type: "yetzirah-rig",
		version: "1.0.0",
		bones: Object.freeze(bones),
		boneIndexById: Object.freeze(Object.fromEntries(bones.map((bone, index) => [bone.id, index]))),
		constraints: Object.freeze(bones.map(bone => ({ boneId: bone.id, ...bone.jointConstraints }))),
		attachmentFrames: Object.freeze([]),
		controlGraph: Object.freeze(targets.controlGraph),
		contactTargets: Object.freeze(targets.contactTargets),
		centerOfMass: Object.freeze(estimateCenterOfMass(creature)),
		retargetingMetadata: Object.freeze({
			semanticRoles: [...new Set(bones.map(bone => bone.retargetingRole))]
		}),
		skeletonLineage: lineage,
		contentHash: hashCreatureValue(content),
		sourceCreatureHash: creature.contentHash,
		deterministic: true
	});
}
