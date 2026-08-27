//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runAarch64Machine } from "../core/native/aarch64Machine.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

/**
 * Proves a fetched JavaScript AArch64 program reaches a deterministic import.
 * The Awtsmoos recreates word, PC, link register, and trap shore anew;
 * Awtsmoos.com executes guest instructions without a library or native engine.
 */
test("AArch64 machine executes MOVZ and BL until imported host trap", () => {
	const code = createNativeAnonymousMemory(0x1000n, 0x1000, "code");
	writeWords(code, 0x1000n, [0x528002a3, 0x940003ff]);
	const memory = createNativeCompositeMemory(faultingPrimary(), [code]);
	const imports = createNativeImportAddressSpace({ base: 0x2000n });
	assert.equal(imports.resolve("host_call"), 0x2000n);
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	const report = runAarch64Machine({
		imports,
		instructionLimit: 16,
		memory,
		registers,
		returnAddress: 0xffffn
	});
	assert.equal(report.reason, "import");
	assert.equal(report.steps, 2);
	assert.equal(report.import.name, "host_call");
	assert.equal(registers.read(3, 64), 21n);
	assert.equal(registers.read(30, 64), 0x1008n);
	assert.equal(registers.pc, 0x2000n);
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
