//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { writeAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeEglConfigState, NATIVE_EGL_CONFIG_VALUES } from "../core/native/nativeEglConfigState.js";
import { registerNativeEglContextHandlers } from "../core/native/nativeEglContextHandlers.js";
import { createNativeEglContextState, NATIVE_EGL_CONTEXT_VALUES } from "../core/native/nativeEglContextState.js";
import { createNativeEglDisplayState } from "../core/native/nativeEglDisplayState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const THREAD = 0x5000n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Proves authentic EGL context and current-display AAPCS64 guest flow.
 * The Awtsmoos renews context, display, X0, and X30 returning ray;
 * Awtsmoos.com measures every guest attribute before state may stay.
 */
test("authentic eglCreateContext returns a guest handle and attributes", () => {
	const fixture = createFixture();
	writeList(fixture.heap, 0x1100n, [[NATIVE_EGL_CONTEXT_VALUES.CONTEXT_CLIENT_VERSION, 2]]);
	const handled = invoke(fixture, "eglCreateContext", fixture.display,
		NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE, 0n, 0x1100n);
	assert.equal(handled.result.result, NATIVE_EGL_CONTEXT_VALUES.CONTEXT_HANDLE_START.toString());
	assert.deepEqual(handled.result.attributes, [{ key: 0x3098, value: 2 }]);
	assert.equal(fixture.registers.read(0), NATIVE_EGL_CONTEXT_VALUES.CONTEXT_HANDLE_START);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("current context and display follow thread binding and release", () => {
	const fixture = createFixture();
	const created = BigInt(invoke(fixture, "eglCreateContext", fixture.display,
		NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE, 0n, 0n).result.result);
	assert.equal(invoke(fixture, "eglGetCurrentContext").result.result, "0");
	assert.equal(invoke(fixture, "eglGetCurrentDisplay").result.result, "0");
	assert.equal(fixture.state.bind(THREAD, created), true);
	assert.equal(invoke(fixture, "eglGetCurrentContext").result.result, created.toString());
	assert.equal(invoke(fixture, "eglGetCurrentDisplay").result.result, fixture.display.toString());
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	fixture.state.bind(THREAD, 0n);
	assert.equal(invoke(fixture, "eglGetCurrentDisplay").result.result, "0");
});

test("destroy handler preserves exact ABI result", () => {
	const fixture = createFixture();
	const created = BigInt(invoke(fixture, "eglCreateContext", fixture.display,
		NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE, 0n, 0n).result.result);
	assert.equal(invoke(fixture, "eglDestroyContext", fixture.display, created).result.result, "1");
	assert.equal(fixture.registers.read(0), 1n);
});

test("unterminated attributes preserve X0 and PC", () => {
	const fixture = createFixture();
	for (let index = 0; index < 128; index += 1) {
		writeAarch64Integer(fixture.heap, 0x1200n + BigInt(index * 4), 1, 32);
	}
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, fixture.display);
	fixture.registers.write(1, NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE);
	fixture.registers.write(2, 0n);
	fixture.registers.write(3, 0x1200n);
	fixture.registers.write(30, RETURN_ADDRESS);
	assert.throws(() => fixture.registry.handle({ name: "eglCreateContext" }, fixture), /NATIVE_EGL_ATTRIBUTE_TERMINATOR/);
	assert.equal(fixture.registers.read(0), fixture.display);
	assert.equal(fixture.registers.pc, 0x9000n);
});

test("production registry exposes context imports exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	for (const name of ["eglCreateContext", "eglDestroyContext",
		"eglGetCurrentContext", "eglGetCurrentDisplay"]) {
		assert.equal(registry.snapshot().filter(candidate => candidate === name).length, 1);
	}
});

function createFixture() {
	const heap = createNativeHeap(0x1000n, 0x4000);
	const displayState = createNativeEglDisplayState({ heap });
	const display = displayState.getDisplay(0n, THREAD).result;
	displayState.initialize(display, THREAD);
	const configState = createNativeEglConfigState(displayState);
	const state = createNativeEglContextState(displayState, configState);
	const registry = createNativeHostImportRegistry();
	registerNativeEglContextHandlers(registry, state);
	return { display, heap, memory: heap, registers: createAarch64Registers({ programCounter: 0x9000n }),
		registry, state, systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: THREAD }) };
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
