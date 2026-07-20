//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { runAarch64MachineWithImports } from "../core/native/aarch64MachineWithImports.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

/**
 * Proves one machine state resumes after an explicitly handled import. The
 * Awtsmoos recreates trap, host testimony, return shore, and preserved register
 * anew; Awtsmoos.com resumes guest motion without restarting memory or CPU state.
 */
test("AArch64 machine resumes across a handled import", () => {
	const code = createNativeAnonymousMemory(0x1000n, 0x1000, "code");
	writeWords(code, 0x1000n, [0x528002a3, 0x940003ff]);
	const memory = createNativeCompositeMemory(faultingPrimary(), [code]);
	const imports = createNativeImportAddressSpace({ base: 0x2000n });
	assert.equal(imports.resolve("host_call"), 0x2000n);
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	const hostImports = createNativeHostImportRegistry({
		host_call(context) {
			context.registers.write(0, 7n, 32, "zero");
			context.registers.pc = 0x3000n;
			return Object.freeze({ returnCode: 7 });
		}
	});
	const report = runAarch64MachineWithImports({
		hostImports,
		imports,
		instructionLimit: 32,
		memory,
		registers,
		returnAddress: 0x3000n
	});
	assert.equal(report.reason, "return");
	assert.equal(report.totalSteps, 2);
	assert.equal(report.hostCalls.length, 1);
	assert.equal(report.hostCalls[0].import.name, "host_call");
	assert.equal(registers.read(0, 32), 7n);
	assert.equal(registers.read(3, 64), 21n);
});

function writeWords(region, address, words) {
	const bytes = new Uint8Array(words.length * 4);
	const view = new DataView(bytes.buffer);
	words.forEach((word, index) => {
		view.setUint32(index * 4, word, true);
	});
	region.write(address, bytes);
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
