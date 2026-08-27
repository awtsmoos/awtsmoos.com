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

test("direct PACIASP, AUTIASP, and XPACLRI preserve every register vessel", () => {
	const registers = createAarch64Registers({
		programCounter: 0x1000n,
		stackPointer: 0x8800n
	});
	registers.write(16, 0x1616n);
	registers.write(17, 0x1717n);
	registers.write(30, 0x123456789abcdef0n);
	registers.writeVector(3, 0xaabbccddn, 128);
	registers.nzcv = 10;
	for (const word of [0xd503233f, 0xd50323bf, 0xd50320ff]) {
		const before = registers.snapshot();
		assert.equal(executeAarch64System(
			decodeAarch64Instruction(word),
			registers
		), true);
		assert.deepEqual(registers.snapshot(), before);
	}
});

test("machine crosses sign, authenticate, and strip hints before import", () => {
	const code = createNativeAnonymousMemory(0x1000n, 0x1000, "pac-hint-code");
	writeWords(code, [
		0xd503233f,
		0xd50323bf,
		0xd50320ff,
		0x528002a3,
		0x940003fc
	]);
	const imports = createNativeImportAddressSpace({ base: 0x2000n });
	imports.resolve("host_call");
	const registers = createAarch64Registers({
		programCounter: 0x1000n,
		stackPointer: 0x8800n
	});
	registers.write(30, 0xabcdefn);
	const report = runAarch64Machine({
		imports,
		instructionLimit: 10,
		memory: createNativeCompositeMemory(faultingPrimary(), [code]),
		registers,
		returnAddress: 0xffffn
	});
	assert.equal(report.reason, "import");
	assert.equal(report.steps, 5);
	assert.equal(registers.read(3, 64), 21n);
	assert.equal(registers.pc, 0x2000n);
});

test("WFE and generic hints remain execution boundaries", () => {
	for (const word of [0xd503205f, hintWord(6)]) {
		const code = createNativeAnonymousMemory(0x1000n, 0x1000, "unsupported-hint");
		writeWords(code, [word]);
		const registers = createAarch64Registers({ programCounter: 0x1000n });
		const report = runAarch64Machine({
			imports: createNativeImportAddressSpace({ base: 0x2000n }),
			instructionLimit: 2,
			memory: createNativeCompositeMemory(faultingPrimary(), [code]),
			registers,
			returnAddress: 0xffffn
		});
		assert.equal(report.reason, "unsupported-instruction");
		assert.equal(registers.pc, 0x1000n);
	}
});

function hintWord(immediate) {
	return (0xd503201f + immediate * 0x20) >>> 0;
}

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
