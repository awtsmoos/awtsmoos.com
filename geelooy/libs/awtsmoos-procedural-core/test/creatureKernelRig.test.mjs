// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createCreatureKernel } from "../src/core/animalMesh/creature/index.js";

async function creatureWithLimbs(pairCount) {
	const kernel = createCreatureKernel();
	const created = await kernel.invoke({ operation: "creature.create", arguments: { seed: 100 + pairCount } });
	const target = { artifactId: created.artifactId };
	for (let index = 0; index < pairCount; index += 1) {
		await kernel.invoke({
			operation: "creature.limb.createPair",
			target,
			arguments: {
				role: "locomotion.support",
				attachmentRegion: index ? "lower-torso" : "upper-torso",
				segments: [
					{ length: 0.6 + index * 0.05, angularLimits: { minimum: -1.1, maximum: 1.1 } },
					{ length: 0.5, preferredBendDirection: [0, 0, 1] }
				]
			}
		});
	}
	return { kernel, target };
}

test("arbitrary limb counts synthesize constrained contact-aware rigs", async () => {
	for (const pairCount of [1, 2, 3, 5]) {
		const { kernel, target } = await creatureWithLimbs(pairCount);
		const rig = await kernel.invoke({ operation: "creature.rig.synthesize", target });
		const validation = await kernel.invoke({ operation: "creature.rig.validate", target });
		assert.equal(validation.valid, true);
		assert.equal(rig.controlGraph.contactTargets.length, pairCount * 2);
		assert.equal(rig.controlGraph.ikTargets.length, pairCount * 2);
		assert.equal(rig.bones.filter((bone) => bone.semanticRole.includes("locomotion.support")).length, pairCount * 4);
		assert.ok(rig.constraints.every((constraint) => constraint.boneId));
	}
});

test("rig rebuild preserves surviving bone IDs and reports anatomy changes", async () => {
	const { kernel, target } = await creatureWithLimbs(1);
	const first = await kernel.invoke({ operation: "creature.compile", target });
	const survivingSourceId = first.yetzirahRig.bones.find((bone) => bone.semanticRole === "axial.spine").sourceAnatomyId;
	await kernel.invoke({
		operation: "creature.body.region.stretch",
		target,
		arguments: { startIndex: 1, endIndex: 4, factor: 1.4 }
	});
	const second = await kernel.invoke({ operation: "creature.compile", target });
	const beforeBone = first.yetzirahRig.bones.find((bone) => bone.sourceAnatomyId === survivingSourceId);
	const afterBone = second.yetzirahRig.bones.find((bone) => bone.sourceAnatomyId === survivingSourceId);
	assert.equal(afterBone.id, beforeBone.id);
	assert.ok(second.yetzirahRig.skeletonLineage.preserved.includes(beforeBone.id));
	const limbId = second.briahCreature.limbs[0].id;
	await kernel.invoke({
		operation: "creature.limb.joint.insert",
		target,
		arguments: { limbId, index: 1, segment: { length: 0.3 } }
	});
	const third = await kernel.invoke({ operation: "creature.compile", target });
	assert.ok(third.yetzirahRig.skeletonLineage.added.length >= 1);
});

test("radial and bilateral relationships remain persistent semantic groups", async () => {
	const { kernel, target } = await creatureWithLimbs(1);
	const inspection = await kernel.invoke({ operation: "creature.inspect", target });
	assert.equal(inspection.briahCreature.symmetryGroups[0].type, "bilateral");
	const created = await kernel.invoke({
		operation: "creature.symmetry.create",
		target,
		arguments: { type: "radial", count: 6, memberIds: [], linkedProperties: ["geometry"] }
	});
	assert.equal(created.symmetryGroup.type, "radial");
	assert.equal(created.symmetryGroup.count, 6);
	await kernel.invoke({
		operation: "creature.symmetry.property.unlink",
		target,
		arguments: { groupId: created.symmetryGroup.id, property: "material" }
	});
	const final = await kernel.invoke({ operation: "creature.inspect", target });
	const radial = final.briahCreature.symmetryGroups.find((group) => group.id === created.symmetryGroup.id);
	assert.ok(radial.independentProperties.includes("material"));
});
