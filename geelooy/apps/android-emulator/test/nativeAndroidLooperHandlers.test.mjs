//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeAndroidLooperCallbackState } from "../core/native/nativeAndroidLooperCallbackState.js";
import { createNativeAndroidLooperState } from "../core/native/nativeAndroidLooperState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";
import { registerNativeAndroidLooperHandlers } from "../core/native/registerNativeAndroidLooperHandlers.js";

const RETURN_ADDRESS = 0x7777n;
const THREAD = 0x5000n;

test("authentic forThread returns NULL before prepare and stable handle after", () => {
	const fixture = createFixture();
	invoke(fixture, "ALooper_forThread");
	assert.equal(fixture.registers.read(0), 0n);
	fixture.registers.write(0, 1n);
	invoke(fixture, "ALooper_prepare");
	const handle = fixture.registers.read(0);
	assert.notEqual(handle, 0n);
	invoke(fixture, "ALooper_forThread");
	assert.equal(fixture.registers.read(0), handle);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("acquire, release, wake, timeout, and missing-thread error are exact", () => {
	const fixture = createFixture();
	const handle = fixture.state.prepare(THREAD);
	fixture.registers.write(0, handle);
	assert.equal(invoke(fixture, "ALooper_acquire").result.accepted, true);
	fixture.registers.write(0, handle);
	assert.equal(invoke(fixture, "ALooper_release").result.accepted, true);
	fixture.registers.write(0, handle);
	assert.equal(invoke(fixture, "ALooper_wake").result.accepted, true);
	fixture.registers.write(0, 0n);
	assert.equal(invoke(fixture, "ALooper_pollOnce").result.result, -1);
	fixture.registers.write(0, 0n);
	assert.equal(invoke(fixture, "ALooper_pollOnce").result.result, -3);
	fixture.systemRegisters.write("TPIDR_EL0", 0x6000n);
	fixture.registers.write(0, 0n);
	assert.equal(invoke(fixture, "ALooper_pollOnce").result.result, -4);
});

test("Flutter registry exposes all eight measured ALooper functions", () => {
	const registry = createFlutterJniImportHandlers({
		javaVmAddress: 0x5000n,
		jniEnvironment: { environmentAddress: "21504" },
		nativeHeap: createNativeHeap(0x6000n, 0x400)
	});
	const names = ["ALooper_acquire", "ALooper_addFd", "ALooper_forThread",
		"ALooper_pollOnce", "ALooper_prepare", "ALooper_release",
		"ALooper_removeFd", "ALooper_wake"];
	for (const name of names) assert.ok(registry.snapshot().includes(name));
});

function createFixture() {
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	const state = createNativeAndroidLooperState();
	const registry = createNativeHostImportRegistry();
	registerNativeAndroidLooperHandlers(registry, {
		callbacks: createNativeAndroidLooperCallbackState(),
		imports: createNativeImportAddressSpace({ base: 0x7000n }),
		state
	});
	return { registers, registry, state, systemRegisters };
}

function invoke(fixture, name) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, fixture);
}
