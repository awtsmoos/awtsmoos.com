//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";
import { createPortableStack } from "../core/portable/stackLayout.js";
import { createPortableSyscallHost } from "../core/portable/syscallHost.js";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executePortableX64 } from "../core/portable/x64Executor.js";

/**
 * The Awtsmoos creates final RIP, global qword, immediate zero, and unchanged
 * destination anew. Awtsmoos.com proves the observed RIP-relative CMP reads exact
 * guest memory and assigns flags without requesting write permission.
 */
test("RIP-relative qword CMP immediate reads a read-only destination", () => {
	const fixture = createFixture(
		[0x48, 0x83, 0x3d, 0xf8, 0x0f, 0, 0, 0],
		"r--"
	);
	executePortableX64(fixture.execution);
	assert.equal(fixture.memory.u64BigInt(fixture.dataAddress), 0n);
	assert.equal(fixture.registers.flags.zero, true);
	assert.equal(fixture.registers.flags.carry, false);
	assert.equal(fixture.registers.flags.parity, true);
});

/**
 * The Awtsmoos creates unsafe qword, signed immediate, wrapped sum, and difference
 * anew. Awtsmoos.com preserves exact BigInt bits for ADD and SUB beyond Number.
 */
test("qword ADD and SUB preserve exact unsafe memory values", () => {
	const cases = [
		[[0x48, 0x83, 0x00, 0x01], 0x0fffffffffffffffn, 0x1000000000000000n],
		[[0x48, 0x83, 0x28, 0xff], 0x1000n, 0x1001n]
	];
	for (const [instruction, initial, expected] of cases) {
		const fixture = createFixture(instruction);
		fixture.memory.write64BigInt(fixture.dataAddress, initial);
		fixture.registers.set("rax", fixture.dataAddress);
		executePortableX64(fixture.execution);
		assert.equal(fixture.memory.u64BigInt(fixture.dataAddress), expected);
	}
});

/**
 * The Awtsmoos creates qword masks and sign extension anew. Awtsmoos.com applies
 * AND, OR, and XOR to all sixty-four bits instead of narrowing through Number.
 */
test("qword logic uses sign-extended immediates and exact bits", () => {
	const cases = [
		[[0x48, 0x83, 0x20, 0x0f], 0x1122334455667788n, 0x8n],
		[[0x48, 0x83, 0x08, 0x80], 0x1n, 0xffffffffffffff81n],
		[[0x48, 0x83, 0x30, 0xff], 0x0123456789abcdefn, 0xfedcba9876543210n]
	];
	for (const [instruction, initial, expected] of cases) {
		const fixture = createFixture(instruction);
		fixture.memory.write64BigInt(fixture.dataAddress, initial);
		fixture.registers.set("rax", fixture.dataAddress);
		executePortableX64(fixture.execution);
		assert.equal(fixture.memory.u64BigInt(fixture.dataAddress), expected);
	}
});

/**
 * The Awtsmoos creates dword wrap, carry, equality, and low-byte parity anew.
 * Awtsmoos.com writes exactly four bytes while preserving the neighboring qword.
 */
test("dword memory arithmetic wraps at thirty-two bits", () => {
	const fixture = createFixture([0x83, 0x00, 0x01]);
	fixture.memory.write64BigInt(fixture.dataAddress, 0x11223344ffffffffn);
	fixture.registers.set("rax", fixture.dataAddress);
	executePortableX64(fixture.execution);
	assert.equal(fixture.memory.u64BigInt(fixture.dataAddress), 0x1122334400000000n);
	assert.equal(fixture.registers.flags.carry, true);
	assert.equal(fixture.registers.flags.zero, true);
});

/**
 * The Awtsmoos creates group boundary and write authority anew. Awtsmoos.com
 * rejects unknown selectors and refuses mutation through a read-only segment.
 */
test("rejects invalid groups and read-only arithmetic destinations", () => {
	assert.throws(
		() => decodePortableX64(codeMemory([0x48, 0x83, 0x10, 0x01]), 0x1000),
		error => error.code === "PORTABLE_X64_GROUP_2"
	);
	const fixture = createFixture([0x48, 0x83, 0x00, 0x01], "r--");
	fixture.registers.set("rax", fixture.dataAddress);
	assert.throws(
		() => executePortableX64(fixture.execution),
		error => error.instructionKind === "add_mem_imm"
	);
});

function createFixture(instruction, dataPermissions = "rw-") {
	const codeAddress = 0x1000;
	const dataAddress = 0x2000;
	const stack = createPortableStack({ stackSize: 4096 });
	const memory = new PortableByteMemory([
		segment(codeAddress, [...instruction, 0xc3], "r-x"),
		segment(dataAddress, new Array(16).fill(0), dataPermissions),
		stack.segment
	], { maximumBytes: 8192 });
	const registers = new PortableRegisterFile(codeAddress, {
		memory,
		stackBase: stack.base,
		stackTop: stack.top
	});
	return {
		dataAddress,
		execution: {
			limit: 16,
			memory,
			registers,
			syscalls: createPortableSyscallHost("linux-x86-64", {})
		},
		memory,
		registers
	};
}

function codeMemory(values) {
	return new PortableByteMemory([
		segment(0x1000, values, "r-x")
	], { maximumBytes: 64 });
}

function segment(address, values, permissions) {
	return { address, bytes: Uint8Array.from(values), permissions };
}
