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
 * Proves exact F7 register, memory, immediate, and RDX:RAX accumulator semantics.
 * The Awtsmoos renews wide bits, flags, products, dividends, and guest exit evidence;
 * Awtsmoos.com tests the same NOT RDX form revealed by the BusyBox witness.
 */
test("executes BusyBox NOT RDX", () => {
	const result = run([
		0x48, 0xba, 15, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xf7, 0xd2,
		0x48, 0x89, 0xd7,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 240);
});

test("executes TEST RDX,imm32 without mutation", () => {
	const result = run([
		0x48, 0xba, 8, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xf7, 0xc2, 7, 0, 0, 0,
		0x48, 0x89, 0xd7,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 8);
	assert.equal(result.registers.flags.zero, true);
});

test("executes NEG qword [RSP-8]", () => {
	const result = run([
		0x48, 0xc7, 0x44, 0x24, 0xf8, 1, 0, 0, 0,
		0x48, 0xf7, 0x5c, 0x24, 0xf8,
		0x48, 0x8b, 0x7c, 0x24, 0xf8,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 255);
	assert.equal(result.registers.flags.carry, true);
});

test("executes unsigned MUL RBX into RDX:RAX", () => {
	const result = run([
		0x48, 0xb8, 3, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xbb, 4, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xf7, 0xe3,
		0x48, 0x89, 0xc7,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 12);
	assert.equal(result.registers.registers.rdx, 0);
});

test("executes unsigned DIV RBX from RDX:RAX", () => {
	const result = run([
		0x48, 0xb8, 20, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xba, 0, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xbb, 3, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xf7, 0xf3,
		0x48, 0x89, 0xd7,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 2);
	assert.equal(result.registers.registers.rax, 60);
});

function exitBytes() {
	return [
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x0f, 0x05
	];
}

function run(bytes) {
	const code = Uint8Array.from(bytes);
	const stack = createPortableStack({ stackSize: 4096 });
	const memory = new PortableByteMemory([
		{
			address: 0x1000,
			bytes: code,
			flags: { execute: true, read: true },
			name: "code"
		},
		stack.segment
	], { maximumBytes: 8192 });
	return executePortableX64({
		limit: 200,
		memory,
		registers: new PortableRegisterFile(0x1000, {
			memory,
			stackBase: stack.base,
			stackTop: stack.top
		}),
		syscalls: createPortableSyscallHost("linux-x86-64", {})
	});
}
