//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readAarch64Integer, writeAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeEglConfigState, NATIVE_EGL_CONFIG_VALUES } from "../core/native/nativeEglConfigState.js";
import { createNativeEglContextState } from "../core/native/nativeEglContextState.js";
import { createNativeEglDisplayState } from "../core/native/nativeEglDisplayState.js";
import { registerNativeEglSurfaceHandlers } from "../core/native/nativeEglSurfaceHandlers.js";
import { createNativeEglSurfaceState, NATIVE_EGL_SURFACE_VALUES } from "../core/native/nativeEglSurfaceState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const THREAD = 0x5000n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Proves pbuffer and current-binding imports preserve exact guest ABI flow.
 * The Awtsmoos renews attributes, output word, X0, and X30 returning flame;
 * Awtsmoos.com keeps each graphics crossing bounded beneath the guest name.
 */
test("authentic eglCreatePbufferSurface and current binding succeed", () => {
	const fixture = createFixture();
	writeList(fixture.heap, 0x1100n, [[0x3057, 1], [0x3056, 1]]);
	const created = invoke(fixture, "eglCreatePbufferSurface", fixture.display,
		fixture.config, 0x1100n);
	const surface = BigInt(created.result.result);
	assert.equal(surface, NATIVE_EGL_SURFACE_VALUES.SURFACE_HANDLE_START);
	assert.equal(created.result.attributes.length, 2);
	assert.equal(invoke(fixture, "eglMakeCurrent", fixture.display, surface,
		surface, fixture.context).result.result, "1");
	assert.equal(invoke(fixture, "eglGetCurrentSurface", 0x3059n).result.result,
		surface.toString());
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("query, swap, release, and destroy use exact ABI results", () => {
	const fixture = createFixture();
	const surface = BigInt(invoke(fixture, "eglCreatePbufferSurface",
		fixture.display, fixture.config, 0n).result.result);
	assert.equal(invoke(fixture, "eglQuerySurface", fixture.display, surface,
		0x3057n, 0x1200n).result.result, "1");
	assert.equal(readAarch64Integer(fixture.heap, 0x1200n, 32), 0n);
	assert.equal(invoke(fixture, "eglSwapBuffers", fixture.display, surface).result.result, "1");
	assert.equal(invoke(fixture, "eglMakeCurrent", fixture.display, 0n, 0n, 0n).result.result, "1");
	assert.equal(invoke(fixture, "eglDestroySurface", fixture.display, surface).result.result, "1");
});

test("unterminated attributes preserve X0 and PC", () => {
	const fixture = createFixture();
	for (let index = 0; index < 128; index += 1) {
		writeAarch64Integer(fixture.heap, 0x1300n + BigInt(index * 4), 1, 32);
	}
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, fixture.display);
	fixture.registers.write(1, fixture.config);
	fixture.registers.write(2, 0x1300n);
	fixture.registers.write(30, RETURN_ADDRESS);
	assert.throws(() => fixture.registry.handle({ name: "eglCreatePbufferSurface" }, fixture),
		/NATIVE_EGL_ATTRIBUTE_TERMINATOR/);
	assert.equal(fixture.registers.read(0), fixture.display);
	assert.equal(fixture.registers.pc, 0x9000n);
});

test("production registry exposes the surface family exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	for (const name of ["eglCreatePbufferSurface", "eglDestroySurface",
		"eglGetCurrentSurface", "eglMakeCurrent", "eglQuerySurface", "eglSwapBuffers"]) {
		assert.equal(registry.snapshot().filter(candidate => candidate === name).length, 1);
	}
});

function createFixture() {
	const heap = createNativeHeap(0x1000n, 0x5000);
	const displayState = createNativeEglDisplayState({ heap });
	const display = displayState.getDisplay(0n, THREAD).result;
	displayState.initialize(display, THREAD);
	const configState = createNativeEglConfigState(displayState);
	const contextState = createNativeEglContextState(displayState, configState);
	const config = NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE;
	const context = contextState.create(display, config, 0n, [], THREAD).result;
	const registry = createNativeHostImportRegistry();
	registerNativeEglSurfaceHandlers(registry,
		createNativeEglSurfaceState(displayState, configState, contextState));
	return { config, context, display, heap, memory: heap,
		registers: createAarch64Registers({ programCounter: 0x9000n }), registry,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: THREAD }) };
}

function invoke(fixture, name, ...values) {
	fixture.registers.pc = 0x9000n;
	values.forEach((value, index) => fixture.registers.write(index, value));
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}

function writeList(memory, address, pairs) {
	pairs.forEach(([key, value], index) => {
		writeAarch64Integer(memory, address + BigInt(index * 8), key, 32);
		writeAarch64Integer(memory, address + BigInt(index * 8 + 4), value, 32);
	});
	writeAarch64Integer(memory, address + BigInt(pairs.length * 8), NATIVE_EGL_CONFIG_VALUES.NONE, 32);
}
