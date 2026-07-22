// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	compileGenomeToBriah,
	createAtzilusGenome,
	createCreatureKernel,
	CREATURE_OPERATION_NAMES
} from "../src/core/animalMesh/creature/index.js";

test("Atzilus compiles deterministically into serializable Briah", () => {
	const genome = createAtzilusGenome({ seed: 48192, axialProportions: { sectionCount: 7 } });
	const first = compileGenomeToBriah(genome);
	const second = compileGenomeToBriah(genome);
	assert.deepEqual(first, second);
	assert.equal(first.type, "briah-creature");
	assert.equal(first.body.sections.length, 7);
	assert.equal(new Set(first.body.sections.map((section) => section.id)).size, 7);
	assert.deepEqual(JSON.parse(JSON.stringify(first)), first);
});

test("operation catalog exposes semantic contracts and public root remains compatible", async () => {
	const kernel = createCreatureKernel();
	const listed = await kernel.invoke({ operation: "creature.operation.list" });
	assert.equal(listed.operations.length, CREATURE_OPERATION_NAMES.length);
	const inspected = await kernel.invoke({
		operation: "creature.operation.inspect",
		arguments: { operation: "creature.rig.synthesize" }
	});
	assert.equal(inspected.determinism, "deterministic-for-equal-state-and-arguments");
	assert.match(inspected.stableReferenceBehavior, /semantic-ids-preserved/);
	const rootModule = await import("../src/index.js");
	const animalModule = await import("../src/core/animalMesh/index.js");
	assert.equal(typeof rootModule.createCreatureKernel, "function");
	assert.equal(typeof animalModule.createCreatureKernel, "function");
	assert.equal(typeof animalModule.AnimalMeshCompiler, "function");
});
