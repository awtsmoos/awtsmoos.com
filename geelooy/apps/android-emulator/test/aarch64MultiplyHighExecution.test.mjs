//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { runAarch64Machine } from "../core/native/aarch64Machine.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";

/**
 * Proves multiply-high arithmetic, aliases, XZR, flags, SP, and PC behavior.
 * The Awtsmoos renews signed and unsigned 128-bit product before the high half;
 * Awtsmoos.com preserves every guest register covenant along the exact path.
 */
test("authentic SMULH produces the measured high half without changing state", () => {
	const registers = createAarch64Registers({
		nzcv: 0b1000,
		programCounter: 9061012n,
		stackPointer: 0x8000n
	});
	registers.write(8, 68002087713n);
	registers.write(9, 2361183241434822607n);
	const instruction = decodeAarch64Instruction(0x9b497d08, registers.pc);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.read(8), 8704267227n);
	assert.equal(registers.pc, 9061012n);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.nzcv, 0b1000);
});

test("signed negative and unsigned maximum products return exact high halves", () => {
	assert.equal(runHigh(true, 0xffffffffffffffffn, 2n), 0xffffffffffffffffn);
	assert.equal(
		runHigh(false, 0xffffffffffffffffn, 0xffffffffffffffffn),
		0xfffffffffffffffen
	);
});

test("source aliases and XZR preserve architectural zero and SP", () => {
	const alias = createAarch64Registers({ stackPointer: 0x9000n });
	alias.write(1, 0xffffffffffffffffn);
	alias.write(2, 2n);
	executeAarch64Data(decodeAarch64Instruction(encode(true, 1, 2, 1)), alias);
	assert.equal(alias.read(1), 0xffffffffffffffffn);
	const zero = createAarch64Registers({ stackPointer: 0x9000n });
	zero.write(2, 99n);
	executeAarch64Data(decodeAarch64Instruction(encode(false, 31, 2, 3)), zero);
	assert.equal(zero.read(3), 0n);
	zero.write(4, 7n);
	executeAarch64Data(decodeAarch64Instruction(encode(false, 2, 4, 31)), zero);
	assert.equal(zero.read(31), 0n);
	assert.equal(zero.sp, 0x9000n);
});

test("machine advances once after SMULH and stops at the following unknown word", () => {
	const code = createNativeAnonymousMemory(0x1000n, 0x100, "multiply-high-code");
	writeWords(code, [encode(true, 0, 1, 2), 0]);
	const memory = createNativeCompositeMemory(faultingPrimary(), [code]);
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	registers.write(0, 68002087713n);
	registers.write(1, 2361183241434822607n);
	const report = runAarch64Machine({
		instructionLimit: 4,
		memory,
		registers
	});
	assert.equal(report.reason, "unknown-instruction");
	assert.equal(report.steps, 1);
	assert.equal(registers.read(2), 8704267227n);
	assert.equal(registers.pc, 0x1004n);
});

function runHigh(signed, left, right) {
	const registers = createAarch64Registers();
	registers.write(0, left);
	registers.write(1, right);
	executeAarch64Data(decodeAarch64Instruction(encode(signed, 0, 1, 2)), registers);
	return registers.read(2);
}

function encode(signed, source, secondSource, destination) {
	const base = signed ? 0x9b407c00 : 0x9bc07c00;
	return (base + (secondSource * 0x10000)
		+ (source * 0x20) + destination) >>> 0;
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
