//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executeMemoryRegisterArithmetic } from "../core/portable/x64MemoryRegisterArithmetic.js";

/**
 * Proves register-destination memory arithmetic uses exact width and flag meaning.
 * The Awtsmoos renews base register, displacement, memory qword, and destination;
 * Awtsmoos.com executes real allocator arithmetic without semantic string scanning.
 */

test("adds a displaced memory qword into RAX", () => {
	const memory = fixtureMemory([0x48, 0x03, 0x47, 0x20], 0x2020, 7n);
	const registers = registerState();
	registers.setBigInt(0, 5n);
	registers.setBigInt(7, 0x2000n);
	const instruction = decodePortableX64(memory, 0x1000);
	assert.equal(instruction.kind, "add_reg_mem");
	assert.equal(instruction.register, 0);
	assert.equal(instruction.width, 64);
	assert.equal(
		executeMemoryRegisterArithmetic(instruction, registers, memory),
		true
	);
	assert.equal(registers.getUnsignedBigInt(0), 12n);
});

test("adds a dword with architectural zero extension", () => {
	const memory = fixtureMemory([0x03, 0x47, 0x20], 0x2020, 2n);
	const registers = registerState();
	registers.setBigInt(0, 0xffffffffffffffffn);
	registers.setBigInt(7, 0x2000n);
	const instruction = decodePortableX64(memory, 0x1000);
	executeMemoryRegisterArithmetic(instruction, registers, memory);
	assert.equal(instruction.width, 32);
	assert.equal(registers.getUnsignedBigInt(0), 1n);
});

test("compares a register with memory without mutation", () => {
	const memory = fixtureMemory([0x48, 0x3b, 0x47, 0x20], 0x2020, 9n);
	const registers = registerState();
	registers.setBigInt(0, 9n);
	registers.setBigInt(7, 0x2000n);
	const instruction = decodePortableX64(memory, 0x1000);
	executeMemoryRegisterArithmetic(instruction, registers, memory);
	assert.equal(registers.getUnsignedBigInt(0), 9n);
	assert.equal(registers.flags.zero, true);
});

test("decodes reverse direct-register ADD roles", () => {
	const memory = fixtureMemory([0x48, 0x03, 0xc1]);
	const instruction = decodePortableX64(memory, 0x1000);
	assert.equal(instruction.kind, "add_reg");
	assert.equal(instruction.destination, 0);
	assert.equal(instruction.source, 1);
});

function fixtureMemory(code, dataAddress = null, dataValue = 0n) {
	const bytes = Uint8Array.from(code);
	return Object.freeze({
		i8(address) {
			return new Int8Array(Uint8Array.of(this.u8(address)).buffer)[0];
		},
		i32(address) {
			return this.u32(address) | 0;
		},
		u8(address) {
			return bytes[address - 0x1000];
		},
		u32(address) {
			assert.equal(address, dataAddress);
			return Number(dataValue & 0xffffffffn);
		},
		u64BigInt(address) {
			assert.equal(address, dataAddress);
			return BigInt.asUintN(64, dataValue);
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
