//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeAndroidLooperCallbackState } from "../core/native/nativeAndroidLooperCallbackState.js";
import { createNativeAndroidLooperState } from "../core/native/nativeAndroidLooperState.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";
import { registerNativeAndroidLooperHandlers } from "../core/native/registerNativeAndroidLooperHandlers.js";

const THREAD = 0x5000n;

test("nonzero callback result keeps descriptor and restores caller road", () => {
	const imports = createNativeImportAddressSpace({ base: 0x7000n });
	const state = createNativeAndroidLooperState();
	const handle = state.prepare(THREAD);
	state.addFd(handle, {
		callback: 0x1100n,
		data: 1n,
		events: 1,
		fd: 7,
		ident: -2
	});
	state.enqueue(handle, 7, 1);
	const registry = createNativeHostImportRegistry();
	registerNativeAndroidLooperHandlers(registry, {
		callbacks: createNativeAndroidLooperCallbackState(),
		imports,
		state
	});
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, 0x7777n);
	const context = {
		registers,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: THREAD })
	};
	registry.handle({ name: "ALooper_pollOnce" }, context);
	assert.equal(registers.pc, 0x1100n);
	const completion = imports.find(registers.read(30));
	registers.write(0, 1n, 32, "zero");
	const handled = registry.handle(completion, context);
	assert.equal(handled.result.result, -2);
	assert.equal(handled.result.kept, true);
	assert.equal(state.removeFd(handle, 7), true);
	assert.equal(registers.pc, 0x7777n);
	assert.equal(registers.read(30), 0x7777n);
});
