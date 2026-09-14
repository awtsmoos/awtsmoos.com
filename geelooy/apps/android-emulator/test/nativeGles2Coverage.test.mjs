//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { NATIVE_GLES2_CORE_COMMANDS_A } from "./nativeGles2CoreCommandsA.mjs";
import { NATIVE_GLES2_CORE_COMMANDS_B } from "./nativeGles2CoreCommandsB.mjs";

const REQUIRED = Object.freeze([
	...NATIVE_GLES2_CORE_COMMANDS_A,
	...NATIVE_GLES2_CORE_COMMANDS_B
]);

/**
 * Keeps production registration at the complete Khronos GLES2 core surface.
 * A missing entrypoint is a release regression even when unrelated aliases remain.
 */
test("production registry exposes every GLES2 core command exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	const names = registry.snapshot();
	assert.equal(REQUIRED.length, 142);
	for (const name of REQUIRED) {
		assert.equal(names.filter(candidate => candidate === name).length, 1, name);
	}
});
