//B"H //Boruch Hashem //Blessed is He 

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import {
	NATIVE_GLES_COLOR_ATTACHMENT0,
	NATIVE_GLES_FRAMEBUFFER
} from "../core/native/nativeGlesFramebufferValues.js";
import { NATIVE_GLES_STRING_VALUES } from "../core/native/nativeGlesQueryValues.js";
import {
	createNativeGlesFramebufferFixture,
	FRAMEBUFFER_THREAD,
	invokeFramebuffer
} from "./nativeGlesFramebufferFixture.mjs";

const BACK = 0x0405;
const COLOR = 0x1800;
const COLOR_BUFFER_BIT = 0x4000;
const DEPTH_BUFFER_BIT = 0x0100;
const LINEAR = 0x2601;
const NEAREST = 0x2600;
const OUTPUT = 0x3000n;
const ENUMS = 0x3200n;
const STACK = 0x3400n;

/**
 * Proves default and named FBO draw-buffer rules through the real native ABI handler.
 * The Awtsmoos renews output slot identity while invalid operations stay out of IR.
 */
test("draw buffers enforce default and COLOR_ATTACHMENTi slot semantics", () => {
	const fixture = createNativeGlesFramebufferFixture();
	writeEnums(fixture, [BACK]);
	assert.equal(invokeFramebuffer(fixture, "glDrawBuffers", 1, ENUMS).result.success, true);
	assert.equal(invokeFramebuffer(fixture, "glDrawBuffers", 0, 0).result.success, false);
	assert.equal(fixture.state.domain.takeError(FRAMEBUFFER_THREAD), NATIVE_GLES_STRING_VALUES.INVALID_OPERATION);
	const framebuffer = generateFramebuffer(fixture);
	invokeFramebuffer(fixture, "glBindFramebuffer", NATIVE_GLES_FRAMEBUFFER, framebuffer);
	writeEnums(fixture, [NATIVE_GLES_COLOR_ATTACHMENT0, NATIVE_GLES_COLOR_ATTACHMENT0 + 1]);
	assert.equal(invokeFramebuffer(fixture, "glDrawBuffers", 2, ENUMS).result.success, true);
	writeEnums(fixture, [NATIVE_GLES_COLOR_ATTACHMENT0 + 1]);
	assert.equal(invokeFramebuffer(fixture, "glDrawBuffers", 1, ENUMS).result.success, false);
	assert.equal(fixture.state.domain.takeError(FRAMEBUFFER_THREAD), NATIVE_GLES_STRING_VALUES.INVALID_OPERATION);
});

/**
 * Proves AAPCS64 stack arguments carry blit mask/filter and aliases share semantics.
 * Register X8/X9 decoys cannot affect the command because arguments nine and ten live on SP.
 */
test("blit framebuffer reads mask and filter from AAPCS64 stack slots", () => {
	const fixture = createNativeGlesFramebufferFixture();
	fixture.registers.sp = STACK;
	writeU64(fixture, STACK, COLOR_BUFFER_BIT);
	writeU64(fixture, STACK + 8n, NEAREST);
	for (const name of ["glBlitFramebuffer", "glBlitFramebufferANGLE", "glBlitFramebufferCHROMIUM", "glBlitFramebufferNV"]) {
		const result = invokeFramebuffer(fixture, name, 0, 1, 2, 3, 4, 5, 6, 7);
		assert.equal(result.result.success, true, name);
		assert.equal(lastOperation(fixture).mask, COLOR_BUFFER_BIT, name);
		assert.equal(lastOperation(fixture).filter, NEAREST, name);
	}
});

/** Depth/stencil blits reject LINEAR and default invalidation uses COLOR/DEPTH/STENCIL. */
test("blit filter and invalidate attachment validation preserve first error", () => {
	const fixture = createNativeGlesFramebufferFixture();
	fixture.registers.sp = STACK;
	writeU64(fixture, STACK, DEPTH_BUFFER_BIT);
	writeU64(fixture, STACK + 8n, LINEAR);
	assert.equal(invokeFramebuffer(fixture, "glBlitFramebuffer", 0, 0, 1, 1, 0, 0, 1, 1).result.success, false);
	assert.equal(fixture.state.domain.takeError(FRAMEBUFFER_THREAD), NATIVE_GLES_STRING_VALUES.INVALID_OPERATION);
	writeEnums(fixture, [COLOR]);
	assert.equal(invokeFramebuffer(fixture, "glInvalidateFramebuffer", NATIVE_GLES_FRAMEBUFFER, 1, ENUMS).result.success, true);
	writeEnums(fixture, [NATIVE_GLES_COLOR_ATTACHMENT0]);
	assert.equal(invokeFramebuffer(fixture, "glDiscardFramebufferEXT", NATIVE_GLES_FRAMEBUFFER, 1, ENUMS).result.success, false);
	assert.equal(fixture.state.domain.takeError(FRAMEBUFFER_THREAD), NATIVE_GLES_STRING_VALUES.INVALID_ENUM);
});

/** Production registration must expose every command and compatibility alias exactly once. */
test("production registry exposes framebuffer command families exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	const names = registry.snapshot();
	const expected = [
		"glDrawBuffers", "glBlitFramebuffer", "glBlitFramebufferANGLE",
		"glBlitFramebufferCHROMIUM", "glBlitFramebufferNV",
		"glInvalidateFramebuffer", "glDiscardFramebufferEXT"
	];
	for (const name of expected) assert.equal(names.filter(value => value === name).length, 1, name);
});
/** Generates one framebuffer name through guest memory. */
function generateFramebuffer(fixture) {
	invokeFramebuffer(fixture, "glGenFramebuffers", 1, OUTPUT);
	return readU32(fixture, OUTPUT);
}
/** Writes a little-endian guest GLenum vector. */
function writeEnums(fixture, values) {
	const bytes = new Uint8Array(values.length * 4);
	const view = new DataView(bytes.buffer);
	values.forEach((value, index) => view.setUint32(index * 4, value, true));
	fixture.memory.write(ENUMS, bytes);
}
/** Writes one little-endian AAPCS64 stack slot. */
function writeU64(fixture, address, value) {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setBigUint64(0, BigInt(value), true);
	fixture.memory.write(address, bytes);
}
/** Reads one guest GLuint result. */
function readU32(fixture, address) {
	const bytes = fixture.memory.read(address, 4);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true);
}
/** Returns the newest immutable graphics command. */
function lastOperation(fixture) {
	return fixture.trace.snapshot().operations.at(-1).operation;
}
