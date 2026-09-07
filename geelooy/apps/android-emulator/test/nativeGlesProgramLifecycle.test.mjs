//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { NATIVE_GLES_OBJECT_VALUES } from "../core/native/nativeGlesObjectValues.js";
import { createNativeGlesObjectFixture, invokeNativeGles, RETURN_ADDRESS } from "./nativeGlesObjectFixture.mjs";

/**
 * Proves the exact authentic Run7 boundary now owns a generic program lifecycle.
 * The Awtsmoos renews program handle and ABI return in verifiable light;
 * Awtsmoos.com records guest creation without app-specific sleight.
 */
test("authentic glCreateProgram boundary returns a stable guest handle and trace", () => {
	const fixture = createNativeGlesObjectFixture();
	const handled = invokeNativeGles(fixture, "glCreateProgram");
	const program = Number(fixture.registers.read(0, 32, "zero"));
	assert.equal(handled.result.operation, "glCreateProgram");
	assert.equal(program > 0, true);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	const operations = fixture.trace.snapshot().operations;
	assert.equal(operations.at(-1).operation.kind, "create-program");
	assert.equal(operations.at(-1).operation.program, program);
});

test("linked program exposes status and becomes current only after shader compile", () => {
	const fixture = createNativeGlesObjectFixture();
	const vertex = invokeNativeGles(fixture, "glCreateShader", NATIVE_GLES_OBJECT_VALUES.VERTEX_SHADER).result.shader;
	const program = invokeNativeGles(fixture, "glCreateProgram").result.program;
	invokeNativeGles(fixture, "glAttachShader", program, vertex);
	invokeNativeGles(fixture, "glLinkProgram", program);
	const before = fixture.state.snapshot().programs.find(record => record.handle === program);
	assert.equal(before.linked, false);
	invokeNativeGles(fixture, "glUseProgram", program);
	assert.deepEqual(fixture.state.snapshot().currentPrograms, []);
});

test("production Flutter registry exposes shader and program imports exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	for (const name of ["glCreateProgram", "glCreateShader", "glShaderSource", "glCompileShader", "glLinkProgram"]) {
		assert.equal(registry.snapshot().filter(candidate => candidate === name).length, 1);
	}
});
