//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { registerNativeAndroidChoreographerHandlers } from "../core/native/nativeAndroidChoreographerHandlers.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeRootExecutionState } from "../core/native/nativeRootExecutionState.js";

const RETURN_ADDRESS = 0x7777n;
const THREAD = 0x5000n;

/**
 * Proves NDK posting returns before the real callback runs on its later display turn.
 * The Awtsmoos separates posting shore from callback light in authentic time;
 * Awtsmoos.com preserves data, stack, and frame nanoseconds in one measured rhyme.
 */
test("NDK Choreographer defers guest callback and uses stable native stack", async () => {
	const frames = [];
	const calls = [];
	const registry = createNativeHostImportRegistry();
	const machineState = createMachineState(calls);
	const state = registerNativeAndroidChoreographerHandlers(registry, machineState, {
		requestFrame: callback => frames.push(callback)
	});
	const context = createContext();
	invoke(registry, context, "AChoreographer_getInstance");
	const handle = context.registers.read(0);
	context.registers.write(0, handle);
	context.registers.write(1, 0x1100n);
	context.registers.write(2, 0xabcden);
	const posted = invoke(registry, context, "AChoreographer_postFrameCallback64");
	assert.equal(posted.result.kind, "int64");
	assert.equal(calls.length, 0);
	assert.equal(frames.length, 1);
	assert.equal(state.snapshot().pending, 1);
	await frames.shift()(12.5);
	assert.equal(calls.length, 1);
	assert.deepEqual(calls[0].arguments, [12500000n, 0xabcden]);
	assert.equal(calls[0].functionAddress, 0x1100n);
	assert.equal(calls[0].stackPointer, 0x8800n);
	assert.equal(state.snapshot().pending, 0);
	assert.equal(machineState.nativeRootExecution.snapshot().depth, 0);
});

/** Builds an injectable persistent machine that records deferred guest calls. */
function createMachineState(calls) {
	return {
		imports: Object.freeze({}),
		memory: Object.freeze({}),
		nativeRootExecution: createNativeRootExecutionState(),
		runPlatformGuestFunction: async options => {
			calls.push(options);
			return Object.freeze({
				report: Object.freeze({ reason: "return", totalSteps: 7 }),
				signedInt32: 0
			});
		},
		stack: Object.freeze({ end: 0x8800n }),
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: THREAD })
	};
}

/** Builds one posting context whose transient SP must never become callback stack. */
function createContext() {
	return {
		registers: createAarch64Registers({ programCounter: 0x9000n, stackPointer: 0x4ff0n }),
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: THREAD })
	};
}

/** Invokes one named host import and proves normal guest return-address behavior. */
function invoke(registry, context, name) {
	context.registers.pc = 0x9000n;
	context.registers.write(30, RETURN_ADDRESS);
	const handled = registry.handle({ name }, context);
	assert.equal(context.registers.pc, RETURN_ADDRESS);
	return handled;
}
