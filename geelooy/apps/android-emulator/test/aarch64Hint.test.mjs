//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64System } from "../core/native/aarch64ExecuteSystem.js";
import { runAarch64Machine } from "../core/native/aarch64Machine.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

/**
 * Proves authentic NOP advances while event and wait hints remain boundaries.
 * The Awtsmoos recreates silent passage, PC motion, and unsupported testimony
 * anew; Awtsmoos.com never promotes unknown concurrency into empty success.
 */
test("HINT decoder names NOP and standard unsupported hints", () => {
	const names = ["nop", "yield", "wfe", "wfi", "sev", "sevl"];
	names.forEach((mnemonic, immediate) => {
		const decoded = decodeAarch64Instruction(hintWord(immediate));
		assert.equal(decoded.family, "system-hint");
		assert.equal(decoded.mnemonic, mnemonic);
		assert.equal(decoded.immediate, immediate);
		assert.equal(decoded.supported, immediate === 0);
	});
	assert.equal(decodeAarch64Instruction(hintWord(63)).mnemonic, "hint");
});

test("direct NOP execution leaves register state untouched", () => {
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	registers.write(0, 0x1122334455667788n);
	registers.writeVector(3, 0xaabbccddn, 128);
	registers.nzcv = 0b1010;
	const before = registers.snapshot();
	assert.equal(executeAarch64System(
		decodeAarch64Instruction(0xd503201f),
		registers
	), true);
	assert.deepEqual(registers.snapshot(), before);
});

test("machine crosses NOP, executes MOVZ, and reaches import", () => {
	const fixture = createMachineFixture([0xd503201f, 0x528002a3, 0x940003fe]);
	const report = runAarch64Machine(fixture.options);
	assert.equal(report.reason, "import");
	assert.equal(report.steps, 3);
	assert.equal(fixture.registers.read(3, 64), 21n);
	assert.equal(fixture.registers.pc, 0x2000n);
});

test("WFE remains unsupported without advancing PC", () => {
	const fixture = createMachineFixture([0xd503205f]);
	const report = runAarch64Machine(fixture.options);
	assert.equal(report.reason, "unsupported-instruction");
	assert.equal(fixture.registers.pc, 0x1000n);
	assert.equal(report.instruction.mnemonic, "wfe");
});

test("MRS TPIDR_EL0 decoding remains intact", () => {
	const decoded = decodeAarch64Instruction(0xd53bd048);
	assert.equal(decoded.family, "system-register-read");
	assert.equal(decoded.systemName, "TPIDR_EL0");
	assert.equal(decoded.destination, 8);
});

function hintWord(immediate) {
	return (0xd503201f + (immediate * 0x20)) >>> 0;
}

function createMachineFixture(words) {
	const code = createNativeAnonymousMemory(0x1000n, 0x1000, "hint-code");
	writeWords(code, words);
	const imports = createNativeImportAddressSpace({ base: 0x2000n });
	imports.resolve("host_call");
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	return Object.freeze({
		options: Object.freeze({
			imports,
			instructionLimit: 16,
			memory: createNativeCompositeMemory(faultingPrimary(), [code]),
			registers,
			returnAddress: 0xffffn
		}),
		registers
	});
}

function writeWords(memory, words) {
	const bytes = new Uint8Array(words.length * 4);
	const view = new DataView(bytes.buffer);
	words.forEach((word, index) => view.setUint32(index * 4, word, true));
	memory.write(0x1000n, bytes);
}

function faultingPrimary() {
	return {
		read(address, size) { throw new Error(`PRIMARY_READ:${address}:${size}`); },
		write(address, bytes) { throw new Error(`PRIMARY_WRITE:${address}:${bytes.length}`); }
	};
}
