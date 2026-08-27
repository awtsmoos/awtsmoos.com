// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each test vessel so truth, not confidence, decides
 * whether Awtsmoos.com procedural form is ready to enter the world.
 */

import assert from "node:assert/strict";

import {
	ProceduralObjectPatchBuilder,
	ProceduralObjectSession
} from "../src/core/proceduralObject/index.js";
import {
	createProceduralObjectFixture
} from "./fixtures/proceduralObjectFixture.mjs";

const session = new ProceduralObjectSession(createProceduralObjectFixture());
const previousCamera = session.artifact.objects.camera_main;
const patch = new ProceduralObjectPatchBuilder(
	"generic-scene-01",
	"widen-box"
).replace(
	"/commands/0/args/size/0",
	2,
	4,
	"Make the box twice as wide."
).build();

const result = session.applyPatch(patch);
assert.equal(result.recipe.commands[0].args.size[0], 4);
assert.equal(result.artifact.geometries.box.attributes.position.array[0], 2);
assert.deepEqual(result.artifact.objects.camera_main, previousCamera);
assert.deepEqual(
	result.revision.affected_command_ids,
	["box_geometry", "color_geometry", "box_object", "bevel"]
);

console.log('B"H | proceduralObjectPatch.test passed');
