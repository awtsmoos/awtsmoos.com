//B"H //Boruch Hashem //Blessed is He 

/**
 * @fileoverview Proves direct GLES draws require real current program/VAO state.
 * The Awtsmoos.com tests exercise native ABI imports and inspect guest graphics IR;
 * invalid enum, value, and operation roads must fail before browser replay exists.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { NATIVE_GLES_STRING_VALUES } from "../core/native/nativeGlesQueryValues.js";
import { createNativeGlesDrawFixture, DRAW_RETURN, DRAW_THREAD, invokeDraw } from "./nativeGlesDrawFixture.mjs";

const TRIANGLES = 0x0004;
const UNSIGNED_SHORT = 0x1403;

test("array and instanced array draws enter authentic guest graphics IR", () => {
	const fixture = createNativeGlesDrawFixture();
	assert.equal(invokeDraw(fixture, "glDrawArrays", TRIANGLES, 0, 3).result.success, true);
	assert.equal(lastOperation(fixture).kind, "draw-arrays");
	assert.equal(invokeDraw(fixture, "glDrawArraysInstancedANGLE", TRIANGLES, 2, 6, 4).result.success, true);
	const operation = lastOperation(fixture);
	assert.equal(operation.kind, "draw-arrays-instanced");
	assert.equal(operation.instanceCount, 4);
	assert.equal(operation.program, fixture.program.handle);
	assert.equal(fixture.registers.pc, DRAW_RETURN);
});

test("indexed, range, and instanced draws retain EBO and byte-offset truth", () => {
	const fixture = createNativeGlesDrawFixture();
	assert.equal(invokeDraw(fixture, "glDrawElements", TRIANGLES, 6, UNSIGNED_SHORT, 0).result.success, true);
	assert.equal(lastOperation(fixture).elementBuffer, fixture.elementBuffer);
	assert.equal(invokeDraw(fixture, "glDrawRangeElements", TRIANGLES, 0, 5, 6, UNSIGNED_SHORT, 2).result.success, true);
	assert.deepEqual(lastOperation(fixture).range, { end: 5, start: 0 });
	assert.equal(invokeDraw(fixture, "glDrawElementsInstancedEXT", TRIANGLES, 6, UNSIGNED_SHORT, 0, 3).result.success, true);
	assert.equal(lastOperation(fixture).instanceCount, 3);
});

test("draw validation preserves first GLES error without fake success", () => {
	const fixture = createNativeGlesDrawFixture();
	fixture.objects.setCurrent(fixture.context, 0);
	assert.equal(invokeDraw(fixture, "glDrawArrays", TRIANGLES, 0, 3).result.success, false);
	assert.equal(fixture.draw.domain.takeError(DRAW_THREAD), NATIVE_GLES_STRING_VALUES.INVALID_OPERATION);
	fixture.objects.setCurrent(fixture.context, fixture.program.handle);
	assert.equal(invokeDraw(fixture, "glDrawElements", TRIANGLES, 3, UNSIGNED_SHORT, 1).result.success, false);
	assert.equal(fixture.draw.domain.takeError(DRAW_THREAD), NATIVE_GLES_STRING_VALUES.INVALID_VALUE);
	assert.equal(invokeDraw(fixture, "glDrawArrays", 0x9999, 0, 3).result.success, false);
	assert.equal(fixture.draw.domain.takeError(DRAW_THREAD), NATIVE_GLES_STRING_VALUES.INVALID_ENUM);
});

test("production registry exposes direct draw families and aliases exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	const names = registry.snapshot();
	const expected = [
		"glDrawArrays",
		"glDrawArraysInstanced",
		"glDrawArraysInstancedANGLE",
		"glDrawArraysInstancedEXT",
		"glDrawElements",
		"glDrawElementsInstanced",
		"glDrawElementsInstancedANGLE",
		"glDrawElementsInstancedEXT",
		"glDrawRangeElements"
	];
	for (const name of expected) {
		assert.equal(names.filter(candidate => candidate === name).length, 1, name);
	}
});

/** Returns the newest immutable guest GLES operation from this fixture's trace. */
function lastOperation(fixture) {
	return fixture.trace.snapshot().operations.at(-1).operation;
}
