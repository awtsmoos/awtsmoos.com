// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createCreatureKernel } from "../src/core/animalMesh/creature/index.js";

test("transactions rollback invalid edits and replay committed history deterministically", async () => {
	const kernel = createCreatureKernel();
	const created = await kernel.invoke({ operation: "creature.create", arguments: { seed: 77 } });
	const target = { artifactId: created.artifactId };
	const successful = await kernel.invoke({ operation: "transaction.begin", target });
	await kernel.invoke({
		operation: "creature.limb.createPair",
		transactionId: successful.transactionId,
		target,
		arguments: { role: "locomotion.support" }
	});
	await kernel.invoke({ operation: "transaction.commit", transactionId: successful.transactionId, target });
	const beforeFailed = await kernel.invoke({ operation: "creature.inspect", target });
	const failed = await kernel.invoke({ operation: "transaction.begin", target });
	await kernel.invoke({
		operation: "creature.body.section.scale",
		transactionId: failed.transactionId,
		target,
		arguments: { sectionId: beforeFailed.briahCreature.body.sections[0].id, scale: [0, 0] }
	});
	const diagnostics = await kernel.invoke({ operation: "transaction.validate", transactionId: failed.transactionId, target });
	assert.equal(diagnostics.diagnostics.valid, false);
	await kernel.invoke({ operation: "transaction.rollback", transactionId: failed.transactionId, target });
	const afterFailed = await kernel.invoke({ operation: "creature.inspect", target });
	assert.equal(afterFailed.briahCreature.contentHash, beforeFailed.briahCreature.contentHash);
	const replay = await kernel.invoke({ operation: "creature.replay", target });
	assert.equal(replay.matchesCurrent, true);
	const undo = await kernel.invoke({ operation: "creature.undo", target });
	assert.equal(undo.changed, true);
	const redo = await kernel.invoke({ operation: "creature.redo", target });
	assert.equal(redo.changed, true);
});

test("multidimensional budgets report violations and optimizations", async () => {
	const kernel = createCreatureKernel();
	const created = await kernel.invoke({ operation: "creature.create", arguments: { seed: 19 } });
	const target = { artifactId: created.artifactId };
	await kernel.invoke({ operation: "creature.limb.createPair", target, arguments: { role: "locomotion.support" } });
	const report = await kernel.invoke({
		operation: "creature.budget.validate",
		target,
		arguments: { budget: { maximumBones: 1, maximumVertices: 1, maximumTriangles: 1 } }
	});
	assert.equal(report.valid, false);
	assert.ok(report.violations.some((violation) => violation.dimension === "maximumBones"));
	const optimized = await kernel.invoke({
		operation: "creature.budget.optimize",
		target,
		arguments: { budget: { maximumBones: 1, maximumVertices: 1, maximumTriangles: 1 } }
	});
	assert.ok(optimized.suggestions.length >= 3);
});
