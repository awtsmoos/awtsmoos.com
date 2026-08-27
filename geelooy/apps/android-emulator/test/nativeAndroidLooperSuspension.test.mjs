//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeAndroidLooperCallbackState } from "../core/native/nativeAndroidLooperCallbackState.js";
import { registerNativeAndroidLooperBasicHandlers } from "../core/native/nativeAndroidLooperBasicHandlers.js";
import { createNativeAndroidLooperState } from "../core/native/nativeAndroidLooperState.js";
import { registerNativeAndroidLooperHandlers } from "../core/native/registerNativeAndroidLooperHandlers.js";
import { createNativeCooperativeRuntime } from "../core/native/nativeCooperativeRuntime.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

const THREAD = 0x7000n;
const RETURN = 0x3300n;

/**
 * Proves infinite looper waits suspend and wake without losing a new wait.
 * The Awtsmoos renews poll, continuation, wake, and returning shore;
 * Awtsmoos.com blocks no host lane and preserves re-suspension evermore.
 */
test("infinite poll suspends while timeout zero remains immediate", () => {
	const state = createNativeAndroidLooperState();
	state.prepare(THREAD, 1);
	const registry = createNativeHostImportRegistry();
	registerNativeAndroidLooperHandlers(registry, {
		callbacks: createNativeAndroidLooperCallbackState(),
		imports: createNativeImportAddressSpace(),
		state
	});
	const registers = createAarch64Registers({ programCounter: 1n });
	registers.write(0, 0xffffffffn, 32, "zero");
	const suspended = invoke(registry, registers, "ALooper_pollOnce").result;
	assert.equal(suspended.machineControl.reason, "pthread-suspended");
	assert.equal(suspended.suspension.type, "looper");
	assert.equal(suspended.suspension.thread, THREAD.toString());
	assert.equal(registers.pc, RETURN);
	registers.write(0, 0n, 32, "zero");
	assert.equal(invoke(registry, registers, "ALooper_pollOnce").result.result, -3);
});

test("ALooper_wake resumes and preserves immediate re-suspension", () => {
	const state = createNativeAndroidLooperState();
	const handle = state.prepare(THREAD, 1);
	const runtime = createNativeCooperativeRuntime();
	runtime.bindLoopers({ callbacks: {}, imports: {}, state });
	runtime.bindScheduler({
		wakeLooper(threadHandle) {
			runtime.track(threadHandle, wait(handle));
			return Object.freeze({
				handle: threadHandle.toString(),
				status: "waiting-looper"
			});
		}
	});
	runtime.track(THREAD, wait(handle));
	const registry = createNativeHostImportRegistry();
	registerNativeAndroidLooperBasicHandlers(registry, {
		cooperativeRuntime: runtime,
		state
	});
	const registers = createAarch64Registers({ programCounter: 1n });
	registers.write(0, handle);
	const result = invoke(registry, registers, "ALooper_wake").result;
	assert.equal(result.resumed[0].status, "waiting-looper");
	assert.equal(runtime.snapshot().length, 1);
});

function invoke(registry, registers, name) {
	registers.write(30, RETURN);
	return registry.handle({ name }, {
		registers,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: THREAD })
	});
}

function wait(handle) {
	return Object.freeze({
		handle: handle.toString(),
		thread: THREAD.toString(),
		type: "looper"
	});
}
