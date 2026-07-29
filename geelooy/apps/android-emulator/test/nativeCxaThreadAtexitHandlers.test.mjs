//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { registerNativeCxaAtexitHandlers } from "../core/native/nativeCxaAtexitHandlers.js";
import { createNativeCxaAtexitState } from "../core/native/nativeCxaAtexitState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const AUTHENTIC_THREAD = 123144765440000n;
const RETURN_ADDRESS = 9944644n;

test("authentic thread destructor registration captures exact testimony", () => {
	const fixture = createFixture(AUTHENTIC_THREAD);
	fixture.registers.write(5, 0xabcden);
	const handled = invoke(
		fixture,
		4906916n,
		123136712380504n,
		10765952n
	);
	assert.deepEqual(handled.result, {
		accepted: true,
		argument: "123136712380504",
		destructor: "4906916",
		dsoHandle: "10765952",
		thread: "123144765440000",
		generation: 1,
		operation: "register-thread",
		result: 0
	});
	assert.equal(fixture.registers.read(0, 32), 0n);
	assert.equal(fixture.registers.read(5), 0xabcden);
	assert.equal(fixture.registers.sp, 0x8800n);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	assert.deepEqual(fixture.state.snapshot(), []);
	assert.deepEqual(fixture.state.threadSnapshot(), [handled.result]);
});

test("thread snapshots isolate identities while generation stays global", () => {
	const state = createNativeCxaAtexitState();
	state.register(1n, 2n, 3n);
	state.registerThread(4n, 5n, 6n, 0x1000n);
	state.registerThread(7n, 8n, 9n, 0x2000n);
	assert.deepEqual(state.snapshot().map(record => record.generation), [1]);
	assert.deepEqual(state.threadSnapshot().map(record => record.generation), [2, 3]);
	assert.deepEqual(state.threadSnapshot(0x1000n).map(record => record.thread), [
		"4096"
	]);
});

test("thread capacity rejection leaves accepted testimony unchanged", () => {
	const state = createNativeCxaAtexitState({ maximumThreadRegistrations: 1 });
	const fixture = createFixture(0x5000n, state);
	invoke(fixture, 1n, 2n, 3n);
	const rejected = invoke(fixture, 4n, 5n, 6n);
	assert.equal(rejected.result.accepted, false);
	assert.equal(rejected.result.result, 1);
	assert.equal(rejected.result.thread, "20480");
	assert.equal(fixture.registers.read(0, 32), 1n);
	assert.equal(state.threadSnapshot().length, 1);
});

test("Flutter registry exposes both C++ destructor registration symbols", () => {
	const registry = createFlutterJniImportHandlers({
		javaVmAddress: 0x5000n,
		jniEnvironment: { environmentAddress: "21504" },
		nativeHeap: createNativeHeap(0x6000n, 0x400)
	});
	assert.ok(registry.snapshot().includes("__cxa_atexit"));
	assert.ok(registry.snapshot().includes("__cxa_thread_atexit_impl"));
});

function createFixture(thread, state = createNativeCxaAtexitState()) {
	const registry = createNativeHostImportRegistry();
	registerNativeCxaAtexitHandlers(registry, state);
	const registers = createAarch64Registers({
		programCounter: 0x9000n,
		stackPointer: 0x8800n
	});
	registers.write(30, RETURN_ADDRESS);
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: thread });
	return { registers, registry, state, systemRegisters };
}

function invoke(fixture, destructor, argument, dsoHandle) {
	fixture.registers.write(0, destructor);
	fixture.registers.write(1, argument);
	fixture.registers.write(2, dsoHandle);
	return fixture.registry.handle(
		{ name: "__cxa_thread_atexit_impl" },
		fixture
	);
}
