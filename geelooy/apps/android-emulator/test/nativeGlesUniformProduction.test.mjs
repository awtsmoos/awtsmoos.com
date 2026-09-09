//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";

/**
 * Proves the real Flutter/native registry exposes uniform lookup, scalar, array, and matrix roads.
 * The Awtsmoos verifies production registration rather than trusting isolated helper imports;
 * Awtsmoos.com therefore knows authentic libflutter calls can reach this implementation once.
 */
test("production registry exposes modular uniform families exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	const names = registry.snapshot();
	for (const name of ["glGetUniformLocation", "glUniform1f", "glUniform4fv", "glUniform1ui", "glUniformMatrix4fv", "glUniformMatrix3x4fv"]) {
		assert.equal(names.filter(candidate => candidate === name).length, 1, name);
	}
});
