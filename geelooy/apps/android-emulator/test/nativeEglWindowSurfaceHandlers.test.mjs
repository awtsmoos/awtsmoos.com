//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeEglConfigState, NATIVE_EGL_CONFIG_VALUES } from "../core/native/nativeEglConfigState.js";
import { createNativeEglContextState } from "../core/native/nativeEglContextState.js";
import { createNativeEglDisplayState } from "../core/native/nativeEglDisplayState.js";
import { registerNativeEglSurfaceHandlers } from "../core/native/nativeEglSurfaceHandlers.js";
import { createNativeEglSurfaceState } from "../core/native/nativeEglSurfaceState.js";
import { registerNativeEglWindowSurfaceHandlers } from "../core/native/nativeEglWindowSurfaceHandlers.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const THREAD = 0x5000n;
const WINDOW = 0x6600n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Proves EGL window surfaces inherit measured ANativeWindow dimensions and survive swap.
 * The Awtsmoos renews Java surface, NDK window, EGL surface, and frame in ordered light;
 * Awtsmoos.com keeps guest handles distinct while width and height remain right.
 */
test("eglCreateWindowSurface queries measured dimensions and swaps", () => {
	const fixture = createFixture();
	const created = invoke(
		fixture,
		"eglCreateWindowSurface",
		fixture.display,
		fixture.config,
		WINDOW,
		0n
	);
	const surface = BigInt(created.result.result);
	assert.notEqual(surface, 0n);
	assert.equal(invoke(fixture, "eglQuerySurface", fixture.display, surface,
		0x3057n, 0x9000n).result.result, "1");
	assert.equal(readAarch64Integer(fixture.heap, 0x9000n, 32), 360n);
	assert.equal(invoke(fixture, "eglQuerySurface", fixture.display, surface,
		0x3056n, 0x9004n).result.result, "1");
	assert.equal(readAarch64Integer(fixture.heap, 0x9004n, 32), 640n);
	assert.equal(invoke(fixture, "eglSwapBuffers", fixture.display, surface).result.result, "1");
	assert.equal(invoke(fixture, "eglDestroySurface", fixture.display, surface).result.result, "1");
});

function createFixture() {
	const heap = createNativeHeap(0x1000n, 0x10000);
	const displayState = createNativeEglDisplayState({ heap });
	const display = displayState.getDisplay(0n, THREAD).result;
	displayState.initialize(display, THREAD);
	const configState = createNativeEglConfigState(displayState);
	const contextState = createNativeEglContextState(displayState, configState);
	const config = NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE;
	const state = createNativeEglSurfaceState(displayState, configState, contextState);
	const registry = createNativeHostImportRegistry();
	registerNativeEglSurfaceHandlers(registry, state);
	registerNativeEglWindowSurfaceHandlers(registry, state, {
		require(handle) {
			assert.equal(BigInt(handle), WINDOW);
			return { format: 1, handle: WINDOW, height: 640, width: 360 };
		}
	});
	return {
		config,
		display,
		heap,
		memory: heap,
		registers: createAarch64Registers({ programCounter: 0x8000n }),
		registry,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: THREAD })
	};
}

function invoke(fixture, name, ...values) {
	fixture.registers.pc = 0x8000n;
	values.forEach((value, index) => fixture.registers.write(index, value));
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}
