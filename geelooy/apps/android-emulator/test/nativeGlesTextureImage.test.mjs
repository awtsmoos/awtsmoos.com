//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { registerNativeGlesTextureImageHandlers } from "../core/native/nativeGlesTextureImageHandlers.js";
import {
	createNativeGlesTextureFixture,
	invokeTextureGles,
	TEXTURE_RETURN_ADDRESS
} from "./nativeGlesTextureFixture.mjs";

const TEXTURE_2D = 0x0de1;
const RGBA = 0x1908;
const UNSIGNED_BYTE = 0x1401;
const OUTPUT = 0x3000n;
const PIXELS = 0x3400n;
const STACK = 0x5000n;

/**
 * Proves authentic nine-argument glTexImage2D reads its pixel pointer from guest stack memory.
 * The Awtsmoos renews registers, stack, heap and pixels while Awtsmoos.com freezes only guest-originated bytes.
 */
test("glTexImage2D reads argument nine from guest SP and traces exact pixels", () => {
	const fixture = imageFixture();
	const texture = generateOne(fixture);
	invokeTextureGles(fixture, "glBindTexture", TEXTURE_2D, texture);
	const pixels = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]);
	fixture.memory.write(PIXELS, pixels);
	writeStackPointer(fixture, PIXELS);
	const handled = invokeImage(fixture, [TEXTURE_2D, 0, RGBA, 2, 1, 0, RGBA, UNSIGNED_BYTE]);
	assert.equal(handled.result.success, true);
	assert.equal(fixture.registers.pc, TEXTURE_RETURN_ADDRESS);
	const operation = fixture.trace.snapshot().operations.at(-1).operation;
	assert.equal(operation.kind, "tex-image-2d");
	assert.equal(operation.texture, texture);
	assert.equal(operation.pixelByteLength, pixels.length);
	assert.deepEqual(operation.pixels, Array.from(pixels));
});

test("glTexImage2D preserves null allocation and pixel-store state", () => {
	const fixture = imageFixture();
	const texture = generateOne(fixture);
	invokeTextureGles(fixture, "glBindTexture", TEXTURE_2D, texture);
	assert.equal(invokeTextureGles(fixture, "glPixelStorei", 0x0cf5, 1).result.success, true);
	writeStackPointer(fixture, 0n);
	const handled = invokeImage(fixture, [TEXTURE_2D, 0, RGBA, 3, 2, 0, RGBA, UNSIGNED_BYTE]);
	assert.equal(handled.result.success, true);
	const operation = fixture.trace.snapshot().operations.at(-1).operation;
	assert.equal(operation.pixels, null);
	assert.equal(operation.pixelByteLength, 0);
});

test("production Flutter registry exposes pixel-store and tex-image imports once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	for (const name of ["glPixelStorei", "glTexImage2D"]) {
		assert.equal(registry.snapshot().filter(candidate => candidate === name).length, 1);
	}
});

function imageFixture() {
	const fixture = createNativeGlesTextureFixture();
	registerNativeGlesTextureImageHandlers(fixture.registry, fixture.state);
	return fixture;
}

function generateOne(fixture) {
	invokeTextureGles(fixture, "glGenTextures", 1n, OUTPUT);
	const bytes = fixture.memory.read(OUTPUT, 4);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true);
}

function writeStackPointer(fixture, pointer) {
	fixture.registers.sp = STACK;
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setBigUint64(0, BigInt(pointer), true);
	fixture.memory.write(STACK, bytes);
}

function invokeImage(fixture, values) {
	fixture.registers.pc = 0x8899n;
	values.forEach((value, index) => fixture.registers.write(index, BigInt(value)));
	fixture.registers.write(30, TEXTURE_RETURN_ADDRESS);
	return fixture.registry.handle({ name: "glTexImage2D" }, fixture);
}
