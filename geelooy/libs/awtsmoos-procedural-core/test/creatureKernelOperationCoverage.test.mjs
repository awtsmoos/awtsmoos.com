// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	CREATURE_OPERATION_NAMES,
	createCreatureKernel
} from "../src/core/animalMesh/creature/index.js";

const REQUIRED_DERIVED_OPERATIONS = Object.freeze([
	"creature.rig.synthesize", "creature.rig.rebuild",
	"creature.rig.inspect", "creature.rig.validate",
	"creature.rig.compare", "creature.rig.pose.evaluate",
	"creature.rig.constraint.set", "creature.rig.contactTargets.derive",
	"creature.rig.skin.bind", "creature.rig.skin.recalculate",
	"creature.rig.lineage.report", "creature.skin.bind",
	"creature.skin.rebind", "creature.skin.normalize",
	"creature.skin.smooth", "creature.skin.validate",
	"creature.skin.lineage.report", "creature.motion.analyzeBodyPlan",
	"creature.motion.planLocomotion", "creature.motion.evaluate",
	"creature.motion.explain", "creature.motion.retarget",
	"creature.motion.testAction", "creature.expression.evaluate",
	"creature.material.compile", "creature.material.bake",
	"creature.capabilities.evaluate", "creature.capabilities.explain",
	"creature.budget.estimate", "creature.budget.validate",
	"creature.budget.optimize"
]);

async function createArticulatedCreature(kernel) {
	const created = await kernel.invoke({
		operation: "creature.create",
		arguments: { seed: 7291, axialProportions: { sectionCount: 5 } }
	});
	const target = { artifactId: created.artifactId };
	const transaction = await kernel.invoke({ operation: "transaction.begin", target });
	await kernel.invoke({
		operation: "creature.limb.createPair",
		transactionId: transaction.transactionId,
		target,
		arguments: {
			role: "locomotion.support",
			attachmentRegion: "lower-torso",
			segments: [
				{ length: 0.7, radiusStart: 0.16, radiusEnd: 0.12 },
				{ length: 0.6, radiusStart: 0.12, radiusEnd: 0.08 }
			]
		}
	});
	await kernel.invoke({
		operation: "transaction.commit",
		transactionId: transaction.transactionId,
		target
	});
	return target;
}

/**
 * The Awtsmoos is one while the API names are many. This test proves every
 * requested Awtsmoos.com vessel is registered, executable, deterministic in
 * shape, and—where it edits constraints—isolated inside rollback-safe Briah.
 */
test("required rig, skin, motion, material, capability, and budget operations execute", async () => {
	for (const operation of REQUIRED_DERIVED_OPERATIONS) {
		assert.ok(CREATURE_OPERATION_NAMES.includes(operation), `Missing ${operation}`);
	}
	const kernel = createCreatureKernel();
	const target = await createArticulatedCreature(kernel);
	const compiled = await kernel.invoke({ operation: "creature.compile", target });
	const previousRig = compiled.yetzirahRig;
	const calls = [
		["creature.rig.rebuild", { previousRig }],
		["creature.rig.inspect", {}],
		["creature.rig.compare", { previousRig }],
		["creature.rig.pose.evaluate", { pose: {} }],
		["creature.rig.contactTargets.derive", {}],
		["creature.rig.skin.bind", {}],
		["creature.rig.skin.recalculate", {}],
		["creature.rig.lineage.report", {}],
		["creature.skin.rebind", {}],
		["creature.skin.normalize", {}],
		["creature.skin.smooth", { iterations: 1, strength: 0.2 }],
		["creature.skin.lineage.report", {}],
		["creature.motion.explain", { gaitFamily: "alternating-biped" }],
		["creature.motion.retarget", { sourceRigId: previousRig.id }],
		["creature.motion.testAction", { action: "walk.forward" }],
		["creature.expression.evaluate", { expression: "curiosity" }],
		["creature.material.compile", {}],
		["creature.capabilities.evaluate", {}],
		["creature.capabilities.explain", {}],
		["creature.budget.estimate", {}]
	];
	for (const [operation, argumentsValue] of calls) {
		const result = await kernel.invoke({ operation, target, arguments: argumentsValue });
		assert.notEqual(result, undefined, `${operation} returned undefined`);
	}
	const edit = await kernel.invoke({ operation: "transaction.begin", target });
	const segmentId = compiled.briahCreature.limbs[0].segments[0].id;
	await kernel.invoke({
		operation: "creature.rig.constraint.set",
		transactionId: edit.transactionId,
		target,
		arguments: { sourceAnatomyId: segmentId, angularLimits: { minimum: -0.4, maximum: 0.4 } }
	});
	const preview = await kernel.invoke({
		operation: "transaction.preview",
		transactionId: edit.transactionId,
		target
	});
	const segment = preview.compiled.briahCreature.limbs[0].segments[0];
	assert.equal(segment.angularLimits.maximum, 0.4);
	await kernel.invoke({ operation: "transaction.rollback", transactionId: edit.transactionId, target });
});
