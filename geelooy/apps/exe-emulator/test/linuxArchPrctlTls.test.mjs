//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";
import { createPortableSyscallHost } from "../core/portable/syscallHost.js";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executeMemoryOperation } from "../core/portable/x64MemoryOperations.js";

/**
 * Proves arch_prctl and FS-prefixed memory share exact TLS base state.
 * The Awtsmoos renews Linux syscall, guest pointer, segment base, and qword load;
 * Awtsmoos.com executes thread-local memory rather than returning synthetic success.
 */

test("sets, consumes, and reads back the FS base", () => {
	const fixture = createFixture();
	const { memory, registers, syscalls } = fixture;
	registers.set("rax", 158);
	registers.set("rdi", 0x1002);
	registers.set("rsi", 0x2000);
	const setResult = syscalls.handle(registers, memory);
	assert.equal(setResult.result, 0);
	assert.equal(
		registers.segments.getUnsignedBigInt("fs"),
		0x2000n
	);
	memory.write64BigInt(0x2028, 0x123456789abcdef0n);
	const instruction = decodePortableX64(memory, 0x1000);
	assert.equal(instruction.kind, "mov_reg_mem");
	assert.equal(instruction.address.segment, "fs");
	executeMemoryOperation(instruction, registers, memory);
	assert.equal(
		registers.getUnsignedBigInt("rax"),
		0x123456789abcdef0n
	);
	registers.set("rax", 158);
	registers.set("rdi", 0x1003);
	registers.set("rsi", 0x2080);
	syscalls.handle(registers, memory);
	assert.equal(memory.u64BigInt(0x2080), 0x2000n);
	assert.equal(registers.snapshot().segments.fs, 0x2000);
});

test("supports GS and returns EINVAL for an unknown command", () => {
	const { memory, registers, syscalls } = createFixture();
	registers.set("rax", 158);
	registers.set("rdi", 0x1001);
	registers.set("rsi", 0x2222);
	syscalls.handle(registers, memory);
	assert.equal(
		registers.segments.getUnsignedBigInt("gs"),
		0x2222n
	);
	registers.set("rax", 158);
	registers.set("rdi", 0x9999);
	registers.set("rsi", 0);
	syscalls.handle(registers, memory);
	assert.equal(registers.getBigInt("rax"), -22n);
});

test("rejects FS on a non-memory instruction", () => {
	const memory = new PortableByteMemory([
		segment(0x1000, Uint8Array.from([0x64, 0x90]), {
			execute: true,
			read: true
		})
	]);
	assert.throws(
		() => decodePortableX64(memory, 0x1000),
		error => error?.code === "PORTABLE_X64_SEGMENT_INSTRUCTION"
	);
});

function createFixture() {
	const code = Uint8Array.from([
		0x64, 0x48, 0x8b, 0x04, 0x25,
		0x28, 0x00, 0x00, 0x00
	]);
	const memory = new PortableByteMemory([
		segment(0x1000, code, { execute: true, read: true }),
		segment(0x2000, new Uint8Array(0x200), {
			read: true,
			write: true
		}),
		segment(0x4000, new Uint8Array(0x1000), {
			read: true,
			write: true
		})
	]);
	const registers = new PortableRegisterFile(0x1000, {
		memory,
		stackBase: 0x4000,
		stackTop: 0x5000
	});
	return {
		memory,
		registers,
		syscalls: createPortableSyscallHost("linux-x86-64")
	};
}

function segment(address, bytes, flags) {
	return {
		address,
		bytes,
		flags,
		name: `fixture-${address.toString(16)}`
	};
}
