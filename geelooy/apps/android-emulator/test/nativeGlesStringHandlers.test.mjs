//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeEglConfigState, NATIVE_EGL_CONFIG_VALUES } from "../core/native/nativeEglConfigState.js";
import { createNativeEglContextState } from "../core/native/nativeEglContextState.js";
import { createNativeEglDisplayState } from "../core/native/nativeEglDisplayState.js";
import { registerNativeEglProcAddressHandlers } from "../core/native/nativeEglProcAddressHandlers.js";
import { registerNativeGlesStringHandlers } from "../core/native/nativeGlesStringHandlers.js";
import { createNativeGlesStringState, NATIVE_GLES_STRING_VALUES } from "../core/native/nativeGlesStringState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

const THREAD = 0x5000n;
const RETURN_ADDRESS = 0x7777n;
const NAME_ADDRESS = 0x1200n;

/**
 * Proves measured GLES imports return guest pointers through exact AAPCS64.
 * The Awtsmoos renews descriptor, X0, error, and X30 returning ray;
 * Awtsmoos.com joins dynamic resolution to one explicit handler way.
 */
test("authentic glGetString vendor shape preserves registers and returns", () => {
	const fixture = createFixture();
	fixture.registers.write(5, 0xabcden);
	const handled = invoke(fixture, "glGetString", NATIVE_GLES_STRING_VALUES.VENDOR);
	const pointer = fixture.registers.read(0);
	assert.equal(handled.result.operation, "glGetString");
	assert.equal(handled.result.success, true);
	assert.equal(readCString(fixture.heap, pointer), "Awtsmoos Android Emulator");
	assert.equal(fixture.registers.read(5), 0xabcden);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("glGetError returns and clears an invalid enumeration", () => {
	const fixture = createFixture();
	invoke(fixture, "glGetString", 0xdead);
	const first = invoke(fixture, "glGetError");
	const second = invoke(fixture, "glGetError");
	assert.equal(first.result.error, NATIVE_GLES_STRING_VALUES.INVALID_ENUM);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	assert.equal(second.result.error, NATIVE_GLES_STRING_VALUES.NO_ERROR);
});

test("eglGetProcAddress descriptor executes the same named GLES handler", () => {
	const fixture = createFixture();
	writeCString(fixture.heap, NAME_ADDRESS, "glGetString");
	const resolved = invoke(fixture, "eglGetProcAddress", NAME_ADDRESS);
	const descriptor = fixture.imports.find(BigInt(resolved.result.address));
	assert.equal(descriptor.name, "glGetString");
	assert.equal(fixture.registry.snapshot().includes(descriptor.name), true);
	const handled = invoke(fixture, descriptor.name, NATIVE_GLES_STRING_VALUES.VENDOR);
	assert.equal(handled.result.success, true);
});

test("production Flutter registry exposes GLES string imports exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	for (const name of ["glGetString", "glGetError"]) {
		assert.equal(registry.snapshot().filter(candidate => candidate === name).length, 1);
	}
});

function createFixture() {
	const heap = createNativeHeap(0x1000n, 0x9000);
	const displayState = createNativeEglDisplayState({ heap });
	const display = displayState.getDisplay(0n, THREAD).result;
	displayState.initialize(display, THREAD);
	const configState = createNativeEglConfigState(displayState);
	const contextState = createNativeEglContextState(displayState, configState);
	const created = contextState.create(display, NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE, 0n, [], THREAD);
	contextState.bind(THREAD, created.context);
	const state = createNativeGlesStringState(Object.freeze({ nativeHeap: heap }), contextState);
	const imports = createNativeImportAddressSpace({ base: 0x9000n });
	const registry = createNativeHostImportRegistry();
	registerNativeEglProcAddressHandlers(registry, imports);
	registerNativeGlesStringHandlers(registry, state);
	return {
		heap,
		imports,
		memory: heap,
		registers: createAarch64Registers({ programCounter: 0x8888n }),
		registry,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: THREAD })
	};
}

function invoke(fixture, name, ...values) {
	fixture.registers.pc = 0x8888n;
	values.forEach((value, index) => fixture.registers.write(index, value));
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}

function readCString(memory, pointer) {
	const bytes = memory.read(pointer, 128);
	return new TextDecoder().decode(bytes.slice(0, bytes.indexOf(0)));
}

function writeCString(memory, address, value) {
	const bytes = new TextEncoder().encode(`${value}\0`);
	memory.write(address, bytes);
}
