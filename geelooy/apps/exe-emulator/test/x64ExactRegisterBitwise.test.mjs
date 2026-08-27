//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";
import { createPortableStack } from "../core/portable/stackLayout.js";
import { createPortableSyscallHost } from "../core/portable/syscallHost.js";
import { executePortableX64 } from "../core/portable/x64Executor.js";

/**
 * Proves compiler-sized register logic remains exact beyond Number range.
 * The Awtsmoos renews high bits, low dwords, zero idioms, flags, and departure;
 * Awtsmoos.com tests the same AND, OR, and XOR roads used by real ELF startup.
 */
test("executes exact AND RDX,RCX beyond safe integer range", () => {
	const result = run([
		0x48, 0xba, 0x10, 0x32, 0x54, 0x76, 0x98, 0xba, 0xdc, 0xfe,
		0x48, 0xb9, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f,
		0x48, 0x21, 0xca,
		0x48, 0x89, 0xd7,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 0);
	assert.equal(result.registers.flags.zero, false);
});

test("executes exact OR RDX,RCX beyond safe integer range", () => {
	const result = run([
		0x48, 0xba, 0x10, 0x32, 0x54, 0x76, 0x98, 0xba, 0xdc, 0xfe,
		0x48, 0xb9, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f,
		0x48, 0x09, 0xca,
		0x48, 0x89, 0xd7,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 31);
});

test("executes BusyBox XOR ECX,ECX as a width-aware zero idiom", () => {
	const result = run([
		0x48, 0xb9, 0xef, 0xcd, 0xab, 0x89, 0x67, 0x45, 0x23, 0x81,
		0x31, 0xc9,
		0x48, 0x89, 0xcf,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 0);
	assert.equal(result.registers.registers.rcx, 0);
	assert.equal(result.registers.flags.zero, true);
	assert.equal(result.registers.flags.carry, false);
	assert.equal(result.registers.flags.overflow, false);
});

function exitBytes() {
	return [
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x0f, 0x05
	];
}

function run(bytes) {
	const stack = createPortableStack({ stackSize: 4096 });
	const memory = new PortableByteMemory([
		{
			address: 0x1000,
			bytes: Uint8Array.from(bytes),
			flags: { execute: true, read: true },
			name: "code"
		},
		stack.segment
	], { maximumBytes: 8192 });
	return executePortableX64({
		limit: 100,
		memory,
		registers: new PortableRegisterFile(0x1000, {
			memory,
			stackBase: stack.base,
			stackTop: stack.top
		}),
		syscalls: createPortableSyscallHost("linux-x86-64", {})
	});
}
