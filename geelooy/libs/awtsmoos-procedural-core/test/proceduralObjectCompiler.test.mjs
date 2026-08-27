// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each test vessel so truth, not confidence, decides
 * whether Awtsmoos.com procedural form is ready to enter the world.
 */

import assert from "node:assert/strict";

import {
	proceduralObjectCompiler
} from "../src/core/proceduralObject/index.js";
import {
	createProceduralObjectFixture
} from "./fixtures/proceduralObjectFixture.mjs";

const artifact = proceduralObjectCompiler.compile(createProceduralObjectFixture());

assert.equal(Object.keys(artifact.geometries).length, 2);
assert.equal(artifact.geometries.box_colored.attributes.color.itemSize, 4);
assert.equal(artifact.objects.box_object.geometryId, "box_colored");
assert.equal(artifact.objects.camera_main.type, "camera");
assert.equal(artifact.deferredCommands.length, 1);
assert.equal(artifact.deferredCommands[0].op, "bevel_geometry");

const geometry = artifact.geometries.box_colored;
assert.equal(geometry.attributes.position.array.length, 72);
assert.equal(geometry.indices.array.length, 36);
assert.deepEqual([...artifact.rootObjectIds].sort(), ["box_object", "camera_main"]);

console.log('B"H | proceduralObjectCompiler.test passed');
