//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { runAarch64MachineWithImports } from "../core/native/aarch64MachineWithImports.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeAndroidLooperCallbackState } from "../core/native/nativeAndroidLooperCallbackState.js";
import { createNativeAndroidLooperState } from "../core/native/nativeAndroidLooperState.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";
import { registerNativeAndroidLooperHandlers } from "../core/native/registerNativeAndroidLooperHandlers.js";

const THREAD = 0x5000n;

test("pollOnce executes guest callback and removes fd on zero", () => {
	const code = createNativeAnonymousMemory(0x1000n, 0x1000, "alooper-callback");
	writeWords(code, 0x1000n, [
		movz(0, 0),
		movz(1, 0),
		movz(2, 0),
		movz(3, 0),
		bl(0x1010n, 0x2000n),
		bl(0x1014n, 0x2010n)
	]);
	writeWords(code, 0x1100n, [movz(0, 0), 0xd65f03c0]);
	const imports = createNativeImportAddressSpace({ base: 0x2000n });
	imports.resolve("ALooper_pollOnce");
	imports.resolve("host_done");
	const state = createCallbackLooperState();
	const hostImports = createNativeHostImportRegistry();
	registerNativeAndroidLooperHandlers(hostImports, {
		callbacks: createNativeAndroidLooperCallbackState(),
		imports,
		state
	});
	hostImports.register("host_done", context => {
		context.registers.pc = 0x4000n;
		return Object.freeze({ operation: "host_done" });
	});
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	const report = runAarch64MachineWithImports({
		hostImports,
		imports,
		instructionLimit: 64,
		memory: createNativeCompositeMemory(faultingPrimary(), [code]),
		registers,
		returnAddress: 0x4000n,
		systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: THREAD })
	});
	assert.equal(report.reason, "return");
	assert.deepEqual(report.hostCalls.map(call => call.import.name), [
		"ALooper_pollOnce",
		"__awtsmoos_alooper_callback_complete",
		"host_done"
	]);
	assert.equal(state.removeFd(state.current(THREAD), 9), false);
});

function createCallbackLooperState() {
	const state = createNativeAndroidLooperState();
	const handle = state.prepare(THREAD);
	state.addFd(handle, {
		callback: 0x1100n,
		data: 0x3333n,
		events: 1,
		fd: 9,
		ident: -2
	});
	state.enqueue(handle, 9, 5);
	return state;
}

function movz(register, immediate) {
	return (0xd2800000 | (immediate << 5) | register) >>> 0;
}

function bl(from, to) {
	return (0x94000000 | Number((to - from) / 4n)) >>> 0;
}

function writeWords(memory, address, words) {
	const bytes = new Uint8Array(words.length * 4);
	const view = new DataView(bytes.buffer);
	words.forEach((word, index) => view.setUint32(index * 4, word, true));
	memory.write(address, bytes);
}

function faultingPrimary() {
	return {
		read(address, size) {
			throw new Error(`PRIMARY_READ:${address}:${size}`);
		},
		write(address, bytes) {
			throw new Error(`PRIMARY_WRITE:${address}:${bytes.length}`);
		}
	};
}
