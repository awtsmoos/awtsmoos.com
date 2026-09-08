//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { NATIVE_GLES_STRING_VALUES } from "../core/native/nativeGlesQueryValues.js";
import { NATIVE_GLES_TEXTURE0 } from "../core/native/nativeGlesTextureTargets.js";
import {
	createNativeGlesTextureFixture,
	invokeTextureGles,
	TEXTURE_GUEST_THREAD,
	TEXTURE_RETURN_ADDRESS
} from "./nativeGlesTextureFixture.mjs";

const TEXTURE_2D = 0x0de1;
const TEXTURE_3D = 0x806f;
const OUTPUT = 0x3000n;

/**
 * Proves the exact Run11 glGenTextures boundary writes an authentic guest GLuint name.
 * The Awtsmoos renews the name through guest memory and X30 return while Awtsmoos.com records causal creation.
 */
test("authentic glGenTextures boundary writes guest name and trace", () => {
	const fixture = createNativeGlesTextureFixture();
	const handled = invokeTextureGles(fixture, "glGenTextures", 1n, OUTPUT);
	const bytes = fixture.memory.read(OUTPUT, 4);
	const texture = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true);
	assert.equal(handled.result.success, true);
	assert.equal(texture > 0, true);
	assert.equal(fixture.registers.pc, TEXTURE_RETURN_ADDRESS);
	assert.deepEqual(handled.result.names, [texture]);
	const operation = fixture.trace.snapshot().operations.at(-1).operation;
	assert.equal(operation.kind, "create-texture");
	assert.equal(operation.texture, texture);
});

test("first texture bind fixes target and conflicting target raises invalid operation", () => {
	const fixture = createNativeGlesTextureFixture();
	const texture = generateOne(fixture);
	assert.equal(invokeTextureGles(fixture, "glBindTexture", TEXTURE_2D, texture).result.success, true);
	assert.equal(invokeTextureGles(fixture, "glBindTexture", TEXTURE_3D, texture).result.success, false);
	assert.equal(fixture.state.domain.takeError(TEXTURE_GUEST_THREAD), NATIVE_GLES_STRING_VALUES.INVALID_OPERATION);
});

test("active unit, delete, and production registry preserve lifecycle semantics", () => {
	const fixture = createNativeGlesTextureFixture();
	const texture = generateOne(fixture);
	assert.equal(invokeTextureGles(fixture, "glActiveTexture", NATIVE_GLES_TEXTURE0 + 1).result.success, true);
	assert.equal(invokeTextureGles(fixture, "glBindTexture", TEXTURE_2D, texture).result.success, true);
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setUint32(0, texture, true);
	fixture.memory.write(OUTPUT, bytes);
	assert.equal(invokeTextureGles(fixture, "glDeleteTextures", 1n, OUTPUT).result.success, true);
	assert.equal(invokeTextureGles(fixture, "glBindTexture", TEXTURE_2D, texture).result.success, false);
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	for (const name of ["glActiveTexture", "glBindTexture", "glDeleteTextures", "glGenTextures"]) {
		assert.equal(registry.snapshot().filter(candidate => candidate === name).length, 1);
	}
});

function generateOne(fixture) {
	invokeTextureGles(fixture, "glGenTextures", 1n, OUTPUT);
	const bytes = fixture.memory.read(OUTPUT, 4);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true);
}
