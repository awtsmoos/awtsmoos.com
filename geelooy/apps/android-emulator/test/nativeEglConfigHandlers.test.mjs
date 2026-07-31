//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readAarch64Integer, writeAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { registerNativeEglConfigHandlers } from "../core/native/nativeEglConfigHandlers.js";
import { createNativeEglConfigState, NATIVE_EGL_CONFIG_VALUES } from "../core/native/nativeEglConfigState.js";
import { createNativeEglDisplayState } from "../core/native/nativeEglDisplayState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const THREAD = 0x5000n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Proves authentic eglChooseConfig outputs, list bounds, and ABI preservation.
 * The Awtsmoos renews key/value pairs, config slot, count cell, and X30 way;
 * Awtsmoos.com measures guest pointers before one config enters the array.
 */
test("authentic five-argument call writes one config and count", () => {
	const fixture = createFixture();
	writeList(fixture.heap, 0x1100n, [[0x3024, 8], [0x3040, 4]]);
	const handled = invoke(fixture, 0x1100n, 0x1200n, 1n, 0x1210n);
	assert.equal(handled.result.result, "1");
	assert.equal(readAarch64Integer(fixture.heap, 0x1200n, 64), NATIVE_EGL_CONFIG_VALUES.CONFIG_HANDLE);
	assert.equal(readAarch64Integer(fixture.heap, 0x1210n, 32), 1n);
	assert.deepEqual(handled.result.attributes, [{ key: 0x3024, value: 8 }, { key: 0x3040, value: 4 }]);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("count-only and zero-capacity calls return one available config", () => {
	const fixture = createFixture();
	invoke(fixture, 0n, 0n, 0n, 0x1210n);
	assert.equal(readAarch64Integer(fixture.heap, 0x1210n, 32), 1n);
	invoke(fixture, 0n, 0x1200n, 0n, 0x1214n);
	assert.equal(readAarch64Integer(fixture.heap, 0x1200n, 64), 0n);
	assert.equal(readAarch64Integer(fixture.heap, 0x1214n, 32), 1n);
});

test("null count and negative capacity return EGL_FALSE without outputs", () => {
	const fixture = createFixture();
	assert.equal(invoke(fixture, 0n, 0x1200n, 1n, 0n).result.result, "0");
	assert.equal(invoke(fixture, 0n, 0x1200n, 0xffffffffn, 0x1210n).result.result, "0");
	assert.equal(readAarch64Integer(fixture.heap, 0x1200n, 64), 0n);
});

test("unreadable outputs and unterminated lists preserve X0 and PC", () => {
	const fixture = createFixture();
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, fixture.displayHandle);
	fixture.registers.write(1, 0n);
	fixture.registers.write(2, 0n);
	fixture.registers.write(3, 0n);
	fixture.registers.write(4, 0x5000n);
	fixture.registers.write(30, RETURN_ADDRESS);
	assert.throws(() => fixture.registry.handle({ name: "eglChooseConfig" }, fixture));
	assert.equal(fixture.registers.read(0), fixture.displayHandle);
	assert.equal(fixture.registers.pc, 0x9000n);
	for (let index = 0; index < 128; index += 1) writeAarch64Integer(fixture.heap, 0x1300n + BigInt(index * 4), 1, 32);
	assert.throws(() => invoke(fixture, 0x1300n, 0n, 0n, 0x1210n), /NATIVE_EGL_ATTRIBUTE_TERMINATOR/);
});

test("production Flutter registry exposes eglChooseConfig exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	assert.equal(registry.snapshot().filter(name => name === "eglChooseConfig").length, 1);
});

function createFixture() {
	const heap = createNativeHeap(0x1000n, 0x3000);
	const displayState = createNativeEglDisplayState({ heap });
	const displayHandle = displayState.getDisplay(0n, THREAD).result;
	displayState.initialize(displayHandle, THREAD);
	const configState = createNativeEglConfigState(displayState);
	const registry = createNativeHostImportRegistry();
	registerNativeEglConfigHandlers(registry, { configState, displayState });
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	return { configState, displayHandle, displayState, heap, memory: heap, registers, registry, systemRegisters };
}

function invoke(fixture, attributes, configs, capacity, count) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, fixture.displayHandle);
	fixture.registers.write(1, attributes);
	fixture.registers.write(2, configs);
	fixture.registers.write(3, capacity);
	fixture.registers.write(4, count);
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name: "eglChooseConfig" }, fixture);
}

function writeList(memory, address, pairs) {
	pairs.forEach(([key, value], index) => {
		writeAarch64Integer(memory, address + BigInt(index * 8), key, 32);
		writeAarch64Integer(memory, address + BigInt(index * 8 + 4), value, 32);
	});
	writeAarch64Integer(memory, address + BigInt(pairs.length * 8), NATIVE_EGL_CONFIG_VALUES.NONE, 32);
}
