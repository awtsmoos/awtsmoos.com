//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64System } from "../core/native/aarch64ExecuteSystem.js";
import { runAarch64Machine } from "../core/native/aarch64Machine.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

test("direct barrier execution preserves every explicit state vessel", () => {
	const registers = createAarch64Registers({
		programCounter: 0x1000n,
		stackPointer: 0x8800n
	});
	registers.write(0, 0x1234n);
	registers.writeVector(2, 0xaabbccddn, 128);
	registers.nzcv = 10;
	const system = createAarch64SystemRegisters({ TPIDR_EL0: 0x6000n });
	const before = registers.snapshot();
	const systemBefore = system.snapshot();
	assert.equal(executeAarch64System(
		decodeAarch64Instruction(0xd50339bf),
		registers,
		system
	), true);
	assert.deepEqual(registers.snapshot(), before);
	assert.deepEqual(system.snapshot(), systemBefore);
});

test("machine crosses DMB, executes MOVZ, and reaches import", () => {
	const code = createNativeAnonymousMemory(0x1000n, 0x1000, "barrier-code");
	writeWords(code, [0xd50339bf, 0x528002a3, 0x940003fe]);
	const imports = createNativeImportAddressSpace({ base: 0x2000n });
	imports.resolve("host_call");
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	const report = runAarch64Machine({
		imports,
		instructionLimit: 8,
		memory: createNativeCompositeMemory(faultingPrimary(), [code]),
		registers,
		returnAddress: 0xffffn
	});
	assert.equal(report.reason, "import");
	assert.equal(report.steps, 3);
	assert.equal(registers.read(3, 64), 21n);
	assert.equal(registers.pc, 0x2000n);
});

function writeWords(memory, words) {
	const bytes = new Uint8Array(words.length * 4);
	const view = new DataView(bytes.buffer);
	words.forEach((word, index) => view.setUint32(index * 4, word, true));
	memory.write(0x1000n, bytes);
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
