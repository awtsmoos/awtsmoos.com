// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createCreatureKernel } from "../src/core/animalMesh/creature/index.js";

/**
 * Reveals the complete local API descent from hereditary intent through semantic
 * anatomy and formed rig into renderer-neutral artifacts. The Awtsmoos renews
 * every vessel, while the test proves that stable meaning survives transaction,
 * rollback, replay, remeshing, skinning, paint, locomotion, and export.
 */
test("acceptance: constructs, animates, validates, replays, and exports through invoke", async () => {
	const proceduralCore = createCreatureKernel();
	const created = await proceduralCore.invoke({
		operation: "creature.create",
		version: "1.0.0",
		arguments: { seed: 48192, axialProportions: { sectionCount: 6 } }
	});
	const target = { artifactId: created.artifactId };
	const transaction = await proceduralCore.invoke({ operation: "transaction.begin", target });
	const transactionId = transaction.transactionId;

	await proceduralCore.invoke({
		operation: "creature.body.region.stretch",
		transactionId,
		target,
		arguments: { startIndex: 1, endIndex: 5, factor: 1.25 }
	});
	await proceduralCore.invoke({
		operation: "creature.body.region.bend",
		transactionId,
		target,
		arguments: { startIndex: 2, endIndex: 5, amount: 0.06, roll: 0.03 }
	});
	await proceduralCore.invoke({
		operation: "creature.limb.createPair",
		transactionId,
		target,
		arguments: {
			role: "locomotion.support",
			attachmentRegion: "lower-torso",
			segments: [
				{ length: 0.8, radiusStart: 0.2, radiusEnd: 0.15 },
				{ length: 0.7, radiusStart: 0.15, radiusEnd: 0.1 }
			],
			endPartDefinitionId: "part.foot.three-toed"
		}
	});
	for (const [definitionId, category, angularPosition] of [
		["part.eye.round", "eye", -0.35],
		["part.eye.round", "eye", 0.35],
		["part.mouth.jaw", "mouth", 0]
	]) {
		await proceduralCore.invoke({
			operation: "creature.part.attach",
			transactionId,
			target,
			arguments: {
				definitionId,
				category,
				attachmentRegion: "anterior",
				axialPosition: 0.95,
				angularPosition,
				capabilities: category === "mouth" ? { bite: 0.7 } : {}
			}
		});
	}
	await proceduralCore.invoke({
		operation: "creature.material.layer.add",
		transactionId,
		target,
		arguments: {
			role: "base",
			palette: [[0.2, 0.5, 0.7, 1]],
			pattern: { type: "solid" }
		}
	});
	await proceduralCore.invoke({
		operation: "creature.material.layer.add",
		transactionId,
		target,
		arguments: {
			role: "detail",
			palette: [[0.9, 0.8, 0.2, 1], [0.1, 0.1, 0.2, 1]],
			pattern: { type: "stripes", frequency: 7 },
			mask: { type: "dorsal" },
			opacity: 0.65
		}
	});

	const preview = await proceduralCore.invoke({
		operation: "transaction.preview",
		transactionId,
		target,
		arguments: { lodLevels: 3 }
	});
	assert.equal(preview.compiled.briahCreature.limbs.length, 2);
	assert.equal(preview.compiled.briahCreature.parts.length, 3);
	assert.ok(preview.compiled.yetzirahRig.bones.length > preview.compiled.briahCreature.body.sections.length);

	const committed = await proceduralCore.invoke({ operation: "transaction.commit", transactionId, target });
	assert.equal(committed.revision, 2);
	const compiled = await proceduralCore.invoke({
		operation: "creature.compile",
		target,
		arguments: { deterministic: true, lodLevels: 3 }
	});
	const boundSkin = await proceduralCore.invoke({ operation: "creature.skin.bind", target });
	const locomotion = await proceduralCore.invoke({
		operation: "creature.motion.planLocomotion",
		target,
		arguments: { gaitFamily: "alternating-biped" }
	});
	const motion = await proceduralCore.invoke({
		operation: "creature.motion.evaluate",
		target,
		arguments: { action: "walk.forward" }
	});
	const paint = await proceduralCore.invoke({ operation: "creature.material.bake", target });
	const validation = await proceduralCore.invoke({ operation: "creature.validate", target });
	assert.equal(validation.valid, true);
	assert.equal(compiled.lodSet.levels.length, 3);
	assert.equal(compiled.asiyahCreatureArtifacts.exportArtifacts.typedArrays, true);
	assert.equal(boundSkin.jointWeights.length > 0, true);
	assert.equal(locomotion.gaitFamily, "alternating-biped");
	assert.equal(motion.diagnostics.constraintsSatisfied, true);
	assert.equal(paint.colors.length, compiled.asiyahMesh.positions.length / 3 * 4);

	const failedEdit = await proceduralCore.invoke({ operation: "transaction.begin", target });
	await proceduralCore.invoke({
		operation: "creature.body.section.scale",
		transactionId: failedEdit.transactionId,
		target,
		arguments: {
			sectionId: compiled.briahCreature.body.sections[0].id,
			scale: [0, 0]
		}
	});
	const failedValidation = await proceduralCore.invoke({
		operation: "transaction.validate",
		transactionId: failedEdit.transactionId,
		target
	});
	assert.equal(failedValidation.diagnostics.valid, false);
	await proceduralCore.invoke({
		operation: "transaction.rollback",
		transactionId: failedEdit.transactionId,
		target
	});

	const replay = await proceduralCore.invoke({ operation: "creature.replay", target });
	assert.equal(replay.matchesCurrent, true);
	const exported = await proceduralCore.invoke({ operation: "creature.export", target });
	assert.equal(exported.briahCreature.type, "briah-creature");
	assert.equal(exported.yetzirahRig.type, "yetzirah-rig");
	assert.equal(exported.asiyahCreatureArtifacts.type, "asiyah-creature-artifacts");
});
