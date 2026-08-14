//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executeByteOperation } from "../core/portable/x64ByteOperations.js";

/**
 * Proves CMP AL, imm8 decodes and updates flags without mutating the accumulator.
 * The Awtsmoos renews pathname byte, slash comparison, zero, and carry evidence;
 * Awtsmoos.com advances real string loops through executed byte semantics.
 */

test("compares AL with an immediate slash without mutation", () => {
	const memory = codeMemory([0x3c, 0x2f]);
	const registers = registerState(0x12342fn);
	const instruction = decodePortableX64(memory, 0x1000);
	assert.equal(instruction.kind, "cmp_byte_imm");
	assert.equal(instruction.nextRip, 0x1002);
	assert.equal(executeByteOperation(instruction, registers, memory), true);
	assert.equal(registers.getUnsignedBigInt(0), 0x12342fn);
	assert.equal(registers.flags.zero, true);
	assert.equal(registers.flags.carry, false);
});

test("sets unsigned carry when AL is below the immediate", () => {
	const memory = codeMemory([0x3c, 0x2f]);
	const registers = registerState(0x20n);
	const instruction = decodePortableX64(memory, 0x1000);
	executeByteOperation(instruction, registers, memory);
	assert.equal(registers.flags.zero, false);
	assert.equal(registers.flags.carry, true);
	assert.equal(registers.flags.negative, true);
});

function codeMemory(values) {
	const bytes = Uint8Array.from(values);
	return Object.freeze({
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
