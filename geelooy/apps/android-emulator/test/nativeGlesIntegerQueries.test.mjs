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

const THREAD = 0x7000n;
const RETURN_ADDRESS = 0x9999n;

/**
 * Proves the authentic integer query writes one guest scalar and returns void.
 * The Awtsmoos renews pname, stack bytes, thread, and X30 returning ray;
 * Awtsmoos.com keeps extension count and extension string in one truthful way.
 */
test("authentic GL_NUM_EXTENSIONS writes zero without changing X0", () => {
	const fixture = createFixture(true);
	const output = fixture.heap.allocate(4n);
	fixture.heap.write(output, Uint8Array.of(7, 7, 7, 7));
	fixture.registers.write(5, 0xabcden);
	const handled = invoke(fixture, "glGetIntegerv", NATIVE_GLES_STRING_VALUES.NUM_EXTENSIONS, output);
	assert.equal(handled.result.value, 0);
	assert.deepEqual([...fixture.heap.read(output, 4)], [0, 0, 0, 0]);
	assert.equal(fixture.registers.read(0, 32), BigInt(NATIVE_GLES_STRING_VALUES.NUM_EXTENSIONS));
	assert.equal(fixture.registers.read(1), output);
	assert.equal(fixture.registers.read(5), 0xabcden);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("integer and string extension models agree", () => {
	const fixture = createFixture(true);
	const integer = fixture.state.queryInteger(NATIVE_GLES_STRING_VALUES.NUM_EXTENSIONS, THREAD);
	const string = fixture.state.queryString(NATIVE_GLES_STRING_VALUES.EXTENSIONS, THREAD);
	assert.equal(integer.value, 0);
	assert.equal(readCString(fixture.heap, string.result), "");
});

test("invalid integer queries preserve output and expose GLES errors", () => {
	const fixture = createFixture(true);
	const output = fixture.heap.allocate(4n);
	fixture.heap.write(output, Uint8Array.of(1, 2, 3, 4));
	invoke(fixture, "glGetIntegerv", 0xdead, output);
	assert.deepEqual([...fixture.heap.read(output, 4)], [1, 2, 3, 4]);
	assert.equal(invoke(fixture, "glGetError").result.error, NATIVE_GLES_STRING_VALUES.INVALID_ENUM);
	const unbound = createFixture(false);
	const other = unbound.heap.allocate(4n);
	unbound.heap.write(other, Uint8Array.of(5, 6, 7, 8));
	invoke(unbound, "glGetIntegerv", NATIVE_GLES_STRING_VALUES.NUM_EXTENSIONS, other);
	assert.deepEqual([...unbound.heap.read(other, 4)], [5, 6, 7, 8]);
	assert.equal(invoke(unbound, "glGetError").result.error, NATIVE_GLES_STRING_VALUES.INVALID_OPERATION);
});

test("dynamic and production registries expose glGetIntegerv once", () => {
	const fixture = createFixture(true);
	const name = fixture.heap.allocate(32n);
	fixture.heap.write(name, new TextEncoder().encode("glGetIntegerv\0"));
	const resolved = invoke(fixture, "eglGetProcAddress", name);
	assert.equal(fixture.imports.find(BigInt(resolved.result.address)).name, "glGetIntegerv");
	assert.equal(fixture.registry.snapshot().filter(value => value === "glGetIntegerv").length, 1);
	const production = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	assert.equal(production.snapshot().filter(value => value === "glGetIntegerv").length, 1);
});

function createFixture(bindCurrent) {
	const heap = createNativeHeap(0x1000n, 0x10000);
	const displayState = createNativeEglDisplayState({ heap });
	const display = displayState.getDisplay(0n, THREAD).result;
	displayState.initialize(display, THREAD);
	const configState = createNativeEglConfigState(displayState);
	const contextState = createNativeEglContextState(displayState, configState);
	const created = contextState.create(display, NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE, 0n, [], THREAD);
	if (bindCurrent) contextState.bind(THREAD, created.context);
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
		state,
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
	const bytes = memory.read(pointer, 32);
	return new TextDecoder().decode(bytes.slice(0, bytes.indexOf(0)));
}
