//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { registerNativeEglDisplayHandlers } from "../core/native/nativeEglDisplayHandlers.js";
import { createNativeEglDisplayState, NATIVE_EGL_VALUES } from "../core/native/nativeEglDisplayState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { readNativeCString } from "../core/native/nativeCString.js";

const THREAD = 0x5000n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Proves EGL bootstrap handlers write guest registers, outputs, and strings.
 * The Awtsmoos renews X0, version cells, query pointer, and error-clearing ray;
 * Awtsmoos.com returns through X30 while deterministic display vessels stay.
 */
test("authentic eglGetDisplay zero returns a stable guest handle", () => {
	const fixture = createFixture();
	const handled = invoke(fixture, "eglGetDisplay", 0n);
	assert.equal(handled.result.result, NATIVE_EGL_VALUES.DISPLAY_HANDLE.toString());
	assert.equal(fixture.registers.read(0), NATIVE_EGL_VALUES.DISPLAY_HANDLE);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("eglInitialize writes EGL 1.5 and query returns a guest C string", () => {
	const fixture = createFixture();
	const display = invoke(fixture, "eglGetDisplay", 0n).result.result;
	assert.equal(invoke(fixture, "eglInitialize", BigInt(display), 0x1100n, 0x1104n).result.result, "1");
	assert.equal(readAarch64Integer(fixture.heap, 0x1100n, 32), 1n);
	assert.equal(readAarch64Integer(fixture.heap, 0x1104n, 32), 5n);
	const queried = invoke(fixture, "eglQueryString", BigInt(display), BigInt(NATIVE_EGL_VALUES.CLIENT_APIS));
	assert.equal(readNativeCString(fixture.heap, BigInt(queried.result.result)).text, "OpenGL_ES");
});

test("terminate and eglGetError expose then clear thread-local failure", () => {
	const fixture = createFixture();
	const display = BigInt(invoke(fixture, "eglGetDisplay", 0n).result.result);
	invoke(fixture, "eglInitialize", display);
	assert.equal(invoke(fixture, "eglTerminate", display).result.result, "1");
	assert.equal(invoke(fixture, "eglQueryString", display, BigInt(NATIVE_EGL_VALUES.VERSION)).result.result, "0");
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(invoke(fixture, "eglGetError").result.result, String(NATIVE_EGL_VALUES.NOT_INITIALIZED));
	assert.equal(invoke(fixture, "eglGetError").result.result, String(NATIVE_EGL_VALUES.SUCCESS));
});

test("invalid initialize output pointer preserves registers and display state", () => {
	const fixture = createFixture();
	const display = BigInt(invoke(fixture, "eglGetDisplay", 0n).result.result);
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, display);
	fixture.registers.write(1, 0x5000n);
	fixture.registers.write(2, 0n);
	fixture.registers.write(30, RETURN_ADDRESS);
	assert.throws(() => fixture.registry.handle({ name: "eglInitialize" }, fixture));
	assert.equal(fixture.registers.read(0), display);
	assert.equal(fixture.registers.pc, 0x9000n);
	assert.equal(fixture.state.snapshot().initialized, false);
});

test("production Flutter registry exposes each EGL bootstrap import once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	for (const name of ["eglGetDisplay", "eglInitialize", "eglQueryString", "eglTerminate", "eglGetError"]) {
		assert.equal(registry.snapshot().filter(candidate => candidate === name).length, 1);
	}
});

function createFixture() {
	const heap = createNativeHeap(0x1000n, 0x3000);
	const state = createNativeEglDisplayState({ heap });
	const registry = createNativeHostImportRegistry();
	registerNativeEglDisplayHandlers(registry, state);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	return { heap, memory: heap, registers, registry, state, systemRegisters };
}

function invoke(fixture, name, first = 0n, second = 0n, third = 0n) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, first);
	fixture.registers.write(1, second);
	fixture.registers.write(2, third);
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}
