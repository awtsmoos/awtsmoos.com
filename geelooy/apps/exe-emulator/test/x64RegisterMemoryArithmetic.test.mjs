//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executeRegisterMemoryArithmetic } from "../core/portable/x64RegisterMemoryArithmetic.js";

/**
 * Proves memory-destination register arithmetic preserves direction and exact bits.
 * The Awtsmoos renews stack qword, source register, comparison flags, and mutation;
 * Awtsmoos.com executes the real BusyBox stack check without a binary-specific path.
 */

test("compares BusyBox stack memory with RAX without mutation", () => {
	const fixture = createFixture([
		0x48,
		0x39,
		0x44,
		0x24,
		0x78
	]);
	const { memory, registers } = fixture;
	registers.setBigInt("rsp", 0x3000n);
	registers.setBigInt("rax", 0x1122334455667788n);
	memory.write64BigInt(0x3078, 0x1122334455667788n);
	const instruction = decodePortableX64(memory, 0x1000);
	assert.equal(instruction.kind, "cmp_mem_reg");
	assert.equal(instruction.width, 64);
	executeRegisterMemoryArithmetic(instruction, registers, memory);
	assert.equal(memory.u64BigInt(0x3078), 0x1122334455667788n);
	assert.equal(registers.flags.zero, true);
});

test("adds a register into a qword memory destination", () => {
	const fixture = createFixture([0x48, 0x01, 0x08]);
	const { memory, registers } = fixture;
	registers.setBigInt("rax", 0x2000n);
	registers.setBigInt("rcx", 5n);
	memory.write64BigInt(0x2000, 7n);
	const instruction = decodePortableX64(memory, 0x1000);
	executeRegisterMemoryArithmetic(instruction, registers, memory);
	assert.equal(memory.u64BigInt(0x2000), 12n);
});

test("subtracts a register from dword memory with wraparound", () => {
	const fixture = createFixture([0x29, 0x08]);
	const { memory, registers } = fixture;
	registers.setBigInt("rax", 0x2000n);
	registers.setBigInt("rcx", 2n);
	memory.write32(0x2000, 1);
	const instruction = decodePortableX64(memory, 0x1000);
	executeRegisterMemoryArithmetic(instruction, registers, memory);
	assert.equal(memory.u32(0x2000), 0xffffffff);
	assert.equal(registers.flags.carry, true);
});

function createFixture(code) {
	const memory = new PortableByteMemory([
		segment(0x1000, Uint8Array.from(code), {
			execute: true,
			read: true
		}),
		segment(0x2000, new Uint8Array(0x2000), {
			read: true,
			write: true
		})
	]);
	const registers = new PortableRegisterFile(0x1000, {
		memory,
		stackBase: 0x2000,
		stackTop: 0x4000
	});
	return { memory, registers };
}

function segment(address, bytes, flags) {
	return {
		address,
		bytes,
		flags,
		name: `fixture-${address.toString(16)}`
	};
}
