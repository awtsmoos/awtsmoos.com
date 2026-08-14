//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executeAccumulatorImmediate } from "../core/portable/x64AccumulatorImmediate.js";

/**
 * Proves wide accumulator immediates preserve exact RAX and EAX architecture.
 * The Awtsmoos renews sign extension, zero extension, comparison, and logic flags;
 * Awtsmoos.com executes allocator thresholds without unsafe JavaScript numbers.
 */

test("compares RAX with a sign-extended imm32 without mutation", () => {
	const memory = codeMemory([0x48, 0x3d, 0x50, 0x01, 0x00, 0x00]);
	const registers = registerState(336n);
	const instruction = decodePortableX64(memory, 0x1000);
	assert.equal(instruction.kind, "cmp_acc_imm");
	assert.equal(instruction.width, 64);
	assert.equal(instruction.nextRip, 0x1006);
	executeAccumulatorImmediate(instruction, registers);
	assert.equal(registers.getUnsignedBigInt(0), 336n);
	assert.equal(registers.flags.zero, true);
});

test("adds a negative imm32 to RAX with sixty-four-bit wrapping", () => {
	const memory = codeMemory([0x48, 0x05, 0xff, 0xff, 0xff, 0xff]);
	const registers = registerState(0n);
	const instruction = decodePortableX64(memory, 0x1000);
	executeAccumulatorImmediate(instruction, registers);
	assert.equal(
		registers.getUnsignedBigInt(0),
		0xffffffffffffffffn
	);
});

test("writes EAX with architectural zero extension", () => {
	const memory = codeMemory([0x05, 0x01, 0x00, 0x00, 0x00]);
	const registers = registerState(0xffffffffffffffffn);
	const instruction = decodePortableX64(memory, 0x1000);
	assert.equal(instruction.width, 32);
	executeAccumulatorImmediate(instruction, registers);
	assert.equal(registers.getUnsignedBigInt(0), 0n);
	assert.equal(registers.flags.carry, true);
});

test("AND EAX immediate updates logic flags", () => {
	const memory = codeMemory([0x25, 0x0f, 0x00, 0x00, 0x00]);
	const registers = registerState(0x100n);
	const instruction = decodePortableX64(memory, 0x1000);
	executeAccumulatorImmediate(instruction, registers);
	assert.equal(registers.getUnsignedBigInt(0), 0n);
	assert.equal(registers.flags.zero, true);
	assert.equal(registers.flags.carry, false);
});

function codeMemory(values) {
	const bytes = Uint8Array.from(values);
	const view = new DataView(
		bytes.buffer,
		bytes.byteOffset,
		bytes.byteLength
	);
	return Object.freeze({
		i32(address) {
			return view.getInt32(address - 0x1000, true);
		},
		u8(address) {
			return bytes[address - 0x1000];
		}
	});
}

function registerState(value) {
	const values = new BigUint64Array(16);
	values[0] = BigInt.asUintN(64, value);
	return {
		flags: {
			carry: false,
			direction: false,
			negative: false,
			overflow: false,
			parity: false,
			zero: false
		},
		getUnsignedBigInt(index) {
			return values[index];
		},
		setBigInt(index, next) {
			values[index] = BigInt.asUintN(64, next);
		}
	};
}
