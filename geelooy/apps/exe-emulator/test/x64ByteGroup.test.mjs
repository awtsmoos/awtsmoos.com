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
 * Proves F6 byte groups through real register, memory, accumulator, and syscall paths.
 * The Awtsmoos renews DIL, AL, AH, AX, guest memory, and exact flags together;
 * Awtsmoos.com tests the same TEST form revealed by the external BusyBox witness.
 */
test("executes BusyBox TEST DIL,7 without mutating DIL", () => {
	const result = run([
		0x48, 0xbf, 8, 0, 0, 0, 0, 0, 0, 0,
		0x40, 0xf6, 0xc7, 7,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 8);
	assert.equal(result.registers.flags.zero, true);
});

test("executes NOT AL", () => {
	const result = run([
		0x48, 0xb8, 15, 0, 0, 0, 0, 0, 0, 0,
		0xf6, 0xd0,
		0x48, 0x89, 0xc7,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 240);
});

test("executes NEG byte [RSP-1]", () => {
	const result = run([
		0xc6, 0x44, 0x24, 0xff, 1,
		0xf6, 0x5c, 0x24, 0xff,
		0x8a, 0x44, 0x24, 0xff,
		0x48, 0x89, 0xc7,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 255);
	assert.equal(result.registers.flags.carry, true);
});

test("executes unsigned MUL BL through AX", () => {
	const result = run([
		0x48, 0xb8, 3, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xbb, 4, 0, 0, 0, 0, 0, 0, 0,
		0xf6, 0xe3,
		0x48, 0x89, 0xc7,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 12);
	assert.equal(result.registers.flags.carry, false);
});

test("executes unsigned DIV BL through AL and AH", () => {
	const result = run([
		0x48, 0xb8, 20, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xbb, 3, 0, 0, 0, 0, 0, 0, 0,
		0xf6, 0xf3,
		0x48, 0x89, 0xc7,
		0x48, 0xc1, 0xef, 8,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 2);
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
