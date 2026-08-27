// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each test vessel so truth, not confidence, decides
 * whether Awtsmoos.com procedural form is ready to enter the world.
 */

import assert from "node:assert/strict";

import {
	createBlenderObjectExecutionPlan
} from "../src/adapters/blender/index.js";
import {
	createProceduralArtifactFromAnimalMesh,
	getProceduralObjectCapabilities,
	proceduralDomainRegistry,
	proceduralObjectCompiler
} from "../src/core/proceduralObject/index.js";
import {
	createProceduralObjectFixture
} from "./fixtures/proceduralObjectFixture.mjs";

const recipe = createProceduralObjectFixture();
const artifact = proceduralObjectCompiler.compile(recipe);
const plan = createBlenderObjectExecutionPlan(recipe, artifact);
const capabilities = getProceduralObjectCapabilities();

assert.equal(plan.worker_policy.arbitrary_source_execution, false);
assert.equal(plan.commands.at(-1).op, "bevel_geometry");
assert.equal(capabilities.rendererNeutral, true);
assert.equal(proceduralDomainRegistry.resolve("architecture").id, "architecture");

const universal = createProceduralArtifactFromAnimalMesh({
	schema: "awtsmoos.animal-mesh-artifact",
	parts: [{
		id: "torso",
		positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
		normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
		uvs: [0, 0, 1, 0, 0, 1],
		indices: [0, 1, 2]
	}],
	materials: [],
	rig: {
		enabled: false
	},
	deferredCommands: [],
	diagnostics: []
}, {
	schema_version: "1.0.0",
	recipe_id: "animal-bridge",
	materials: []
});

assert.equal(universal.geometries.torso.attributes.position.itemSize, 3);
assert.equal(universal.objects.torso.geometryId, "torso");

console.log('B"H | proceduralObjectApi.test passed');
