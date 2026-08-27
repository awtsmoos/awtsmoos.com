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
 * The Awtsmoos creates DWORD store, zero-extending destination, TEST flags, and
 * later 64-bit use anew. Awtsmoos.com proves ordinary compiler-width semantics
 * through executable bytes rather than helper-only arithmetic.
 */
test("executes DWORD stack store and zero-extending register load", () => {
	const code = Uint8Array.from([
		0x89, 0x5d, 0xd4,
		0x85, 0xdb,
		0x44, 0x8b, 0x65, 0xd4,
		0x4c, 0x89, 0xe7,
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x0f, 0x05
	]);
	const fixture = createFixture(code);
	fixture.registers.set("rbx", 0x12345678);
	fixture.registers.set("r12", 0x111122223333);
	const result = executePortableX64(fixture.execution);
	assert.equal(fixture.memory.u32(fixture.stack.top - 44), 0x12345678);
	assert.equal(result.registers.registers.r12, 0x12345678);
	assert.equal(result.registers.flags.zero, false);
	assert.equal(result.syscalls.exitCode, 0x78);
});

test("32-bit writes clear the upper register half", () => {
	const code = Uint8Array.from([
		0xb8, 0xef, 0xcd, 0xab, 0x89,
		0x48, 0x89, 0xc7,
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x0f, 0x05
	]);
	const fixture = createFixture(code);
	fixture.registers.set("rax", 0x111122223333);
	const result = executePortableX64(fixture.execution);
	assert.equal(result.syscalls.exitCode, 0xef);
	assert.equal(result.registers.registers.rdi, 0x89abcdef);
});

function createFixture(code) {
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
	const registers = new PortableRegisterFile(0x1000, {
		memory,
		stackBase: stack.base,
		stackTop: stack.top
	});
	return {
		execution: {
			limit: 100,
			memory,
			registers,
			syscalls: createPortableSyscallHost("linux-x86-64", {})
		},
		memory,
		registers,
		stack
	};
}
