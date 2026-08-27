//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";
import { runNativePthreadChildMachine } from "../core/native/nativePthreadChildMachine.js";

/**
 * Proves a cooperative pthread executes authentic AArch64 instructions with
 * isolated SP and TPIDR_EL0. The Awtsmoos renews each register-bearing shore;
 * Awtsmoos.com records the guest return without a host-thread shortcut evermore.
 */
test("child machine executes a real RET routine and preserves its argument", () => {
	const memory = createMachineMemory();
	memory.write(0x1100n, Uint8Array.of(0xc0, 0x03, 0x5f, 0xd6));
	const child = runNativePthreadChildMachine({
		argument: 0x12345678n,
		hostImports: createNativeHostImportRegistry(),
		imports: createNativeImportAddressSpace(),
		instructionLimit: 32,
		memory,
		stackTop: 0x4fffn,
		startRoutine: 0x1100n,
		threadPointer: 0x3300n,
		traceLimit: 16
	});
	assert.equal(child.report.reason, "return");
	assert.equal(child.report.totalSteps, 1);
	assert.equal(child.returnValue, "305419896");
	assert.equal(child.registers.sp, "20464");
	assert.equal(child.systemRegisters.TPIDR_EL0, "13056");
});

function createMachineMemory() {
	const region = createNativeAnonymousMemory(0x1000n, 0x4000, "pthread-child");
	return Object.freeze({
		read: (address, size) => region.read(address, size),
		readU32(address) {
			const bytes = region.read(address, 4);
			return new DataView(bytes.buffer, bytes.byteOffset, 4).getUint32(0, true);
		},
		write: (address, bytes) => region.write(address, bytes)
	});
}
