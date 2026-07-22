// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createCreatureKernel } from "../src/core/animalMesh/creature/index.js";

async function buildSupportCreature(pairCount, options = {}) {
	const kernel = createCreatureKernel();
	const created = await kernel.invoke({
		operation: "creature.create",
		arguments: { seed: options.seed || pairCount + 12, axialProportions: { sectionCount: options.sections || 6 } }
	});
	const target = { artifactId: created.artifactId };
	for (let index = 0; index < pairCount; index += 1) {
		await kernel.invoke({
			operation: "creature.limb.createPair",
			target,
			arguments: { role: options.role || "locomotion.support", contactCapabilities: options.contacts ?? ["ground-support"] }
		});
	}
	return { kernel, target };
}

test("locomotion chooses biped, quadruped, many-legged, and serpentine families", async () => {
	for (const [pairs, expected] of [[1, "biped"], [2, "quadruped"], [4, "many-legged"]]) {
		const { kernel, target } = await buildSupportCreature(pairs);
		const analysis = await kernel.invoke({ operation: "creature.motion.analyzeBodyPlan", target });
		assert.equal(analysis.family, expected);
	}
	const { kernel, target } = await buildSupportCreature(0, { sections: 8 });
	const serpentine = await kernel.invoke({ operation: "creature.motion.analyzeBodyPlan", target });
	assert.equal(serpentine.family, "serpentine");
});

test("wing and fin roles drive propulsion body-plan classification", async () => {
	const winged = await buildSupportCreature(1, { role: "propulsion.wing", contacts: [] });
	const wingAnalysis = await winged.kernel.invoke({ operation: "creature.motion.analyzeBodyPlan", target: winged.target });
	assert.equal(wingAnalysis.family, "winged");
	const finned = await buildSupportCreature(1, { role: "propulsion.fin", contacts: [] });
	const finAnalysis = await finned.kernel.invoke({ operation: "creature.motion.analyzeBodyPlan", target: finned.target });
	assert.equal(finAnalysis.family, "finned");
});

test("attachments, semantic paint, material regions, and skin survive body regeneration", async () => {
	const { kernel, target } = await buildSupportCreature(1);
	const attached = await kernel.invoke({
		operation: "creature.part.attach",
		target,
		arguments: { definitionId: "part.eye.round", category: "eye", bodyRegion: "anterior", axialPosition: 0.9 }
	});
	await kernel.invoke({
		operation: "creature.material.layer.add",
		target,
		arguments: { role: "base", palette: [[0.3, 0.4, 0.8, 1]], mask: { type: "body-axis" } }
	});
	const first = await kernel.invoke({ operation: "creature.compile", target });
	await kernel.invoke({ operation: "creature.body.resample", target, arguments: { sectionCount: 9 } });
	await kernel.invoke({ operation: "creature.body.region.bend", target, arguments: { startIndex: 2, endIndex: 8, amount: 0.04 } });
	const second = await kernel.invoke({ operation: "creature.compile", target });
	const skinValidation = await kernel.invoke({ operation: "creature.skin.validate", target });
	const paint = await kernel.invoke({ operation: "creature.material.bake", target });
	const inspected = await kernel.invoke({ operation: "creature.inspect", target });
	assert.ok(inspected.briahCreature.attachments.some((anchor) => anchor.id === attached.attachment.id));
	assert.equal(second.materials.layers.length, 1);
	assert.equal(second.asiyahMesh.preservationReport.semanticRegions, "preserved");
	assert.equal(skinValidation.valid, true);
	assert.equal(paint.sourceLayerIds.length, 1);
	assert.notEqual(first.asiyahMesh.positions.length, second.asiyahMesh.positions.length);
});
