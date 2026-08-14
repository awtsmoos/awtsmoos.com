//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executeFfArithmetic } from "../core/portable/x64FfArithmetic.js";

/**
 * Proves FF INC and DEC preserve carry while updating exact arithmetic flags.
 * The Awtsmoos renews register, memory, width, overflow, and wrapped result;
 * Awtsmoos.com advances real loops without converting sixty-four bits to Number.
 */

test("increments a sixty-four-bit register and preserves carry", () => {
	const memory = fixtureMemory([0x48, 0xff, 0xc0]);
	const registers = registerState();
	registers.flags.carry = true;
	registers.setBigInt(0, 0x7fffffffffffffffn);
	const instruction = decodePortableX64(memory, 0x1000);
	assert.equal(instruction.kind, "inc_reg");
	assert.equal(executeFfArithmetic(instruction, registers, memory), true);
	assert.equal(registers.getUnsignedBigInt(0), 0x8000000000000000n);
	assert.equal(registers.flags.carry, true);
	assert.equal(registers.flags.overflow, true);
	assert.equal(registers.flags.negative, true);
});

test("increments EAX with architectural zero extension", () => {
	const memory = fixtureMemory([0xff, 0xc0]);
	const registers = registerState();
	registers.setBigInt(0, 0xffffffffffffffffn);
	const instruction = decodePortableX64(memory, 0x1000);
	assert.equal(instruction.width, 32);
	executeFfArithmetic(instruction, registers, memory);
	assert.equal(registers.getUnsignedBigInt(0), 0n);
	assert.equal(registers.flags.zero, true);
});

test("decrements a sixty-four-bit memory operand", () => {
	const memory = fixtureMemory([0x48, 0xff, 0x08], {
		address: 0x2000,
		value: 9n
	});
	const registers = registerState();
	registers.setBigInt(0, 0x2000n);
	const instruction = decodePortableX64(memory, 0x1000);
	assert.equal(instruction.kind, "dec_mem");
	executeFfArithmetic(instruction, registers, memory);
	assert.equal(memory.value(), 8n);
});

test("rejects an unimplemented FF group digit", () => {
	assert.throws(
		() => decodePortableX64(
			fixtureMemory([0x48, 0xff, 0xf8]),
			0x1000
		),
		error => error?.code === "PORTABLE_X64_FF_GROUP"
	);
});

function fixtureMemory(code, data = {}) {
	const bytes = Uint8Array.from(code);
	let stored = BigInt(data.value || 0n);
	return Object.freeze({
		u8(address) {
			return bytes[address - 0x1000];
		},
		u32(address) {
			assert.equal(address, data.address);
			return Number(stored & 0xffffffffn);
		},
		u64BigInt(address) {
			assert.equal(address, data.address);
			return stored;
		},
		value() {
			return stored;
		},
		write32(address, value) {
			assert.equal(address, data.address);
			stored = BigInt(value >>> 0);
		},
		write64BigInt(address, value) {
			assert.equal(address, data.address);
			stored = BigInt.asUintN(64, value);
		}
	});
}

function registerState() {
	const values = new BigUint64Array(16);
	return {
		flags: {
			carry: false,
			direction: false,
			negative: false,
			overflow: false,
			parity: false,
			zero: false
		},
		get(index) {
			return Number(values[index]);
		},
		getUnsignedBigInt(index) {
			return values[index];
		},
		setBigInt(index, value) {
			values[index] = BigInt.asUintN(64, value);
		}
	};
}
