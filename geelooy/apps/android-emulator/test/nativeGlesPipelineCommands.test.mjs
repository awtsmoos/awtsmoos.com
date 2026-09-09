//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { NATIVE_GLES_PIPELINE_SPECS } from "../core/native/nativeGlesPipelineSpecs.js";
import { createNativeGlesPipelineFixture, invokePipeline, PIPELINE_RETURN } from "./nativeGlesPipelineFixture.mjs";

/**
 * Proves typed core-state calls preserve AAPCS64 FP/general register classes and exact IR.
 * The Awtsmoos renews S, D and X argument streams while Awtsmoos.com refuses integer reinterpretation of floats.
 */
test("clear color and depth read S and D registers exactly", () => {
	const fixture = createNativeGlesPipelineFixture();
	[0.125, 0.25, 0.5, 1].forEach((value, index) => fixture.registers.writeFloat(index, value, 32));
	fixture.registers.write(30, PIPELINE_RETURN);
	const color = fixture.registry.handle({ name: "glClearColor" }, fixture);
	assert.deepEqual(color.result.args, [0.125, 0.25, 0.5, 1]);
	fixture.registers.pc = 0x8899n;
	fixture.registers.writeFloat(0, 0.75, 64);
	fixture.registers.write(30, PIPELINE_RETURN);
	const depth = fixture.registry.handle({ name: "glClearDepth" }, fixture);
	assert.deepEqual(depth.result.args, [0.75]);
	assert.equal(fixture.registers.pc, PIPELINE_RETURN);
	assert.deepEqual(fixture.trace.snapshot().operations.map(entry => entry.operation.method), ["clearColor", "clearDepth"]);
});

test("viewport, clear, and color mask preserve X-register values", () => {
	const fixture = createNativeGlesPipelineFixture();
	assert.equal(invokePipeline(fixture, "glViewport", -4, 3, 640, 480).result.success, true);
	assert.equal(invokePipeline(fixture, "glClear", 0x4100).result.success, true);
	assert.equal(invokePipeline(fixture, "glColorMask", 1, 0, 7, 0).result.success, true);
	const operations = fixture.trace.snapshot().operations.map(entry => entry.operation);
	assert.deepEqual(operations[0].args, [-4, 3, 640, 480]);
	assert.deepEqual(operations[1].args, [0x4100]);
	assert.deepEqual(operations[2].args, [true, false, true, false]);
});

test("production registry exposes every pipeline spec exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({ javaVmAddress: 0x5000n, jniEnvironment: Object.freeze({ environmentAddress: "21504" }) }));
	const names = registry.snapshot();
	for (const spec of NATIVE_GLES_PIPELINE_SPECS) assert.equal(names.filter(name => name === spec.name).length, 1, spec.name);
});
