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
 * Proves MOVZX byte and word sources across register and mapped-memory roads.
 * The Awtsmoos renews SIL, ESI, guest bytes, guest words, and zero extension;
 * Awtsmoos.com tests the same MOVZX ESI,SIL form revealed by BusyBox startup.
 */
test("executes BusyBox MOVZX ESI,SIL", () => {
	const result = run([
		0x48, 0xbe, 0xab, 0xcd, 0xef, 0x89, 0x67, 0x45, 0x23, 0x81,
		0x40, 0x0f, 0xb6, 0xf6,
		0x48, 0x89, 0xf7,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 0xab);
	assert.equal(result.registers.registers.rsi, 0xab);
});

test("zero-extends a mapped byte into EDI", () => {
	const result = run([
		0xc6, 0x44, 0x24, 0xff, 0xd2,
		0x0f, 0xb6, 0x7c, 0x24, 0xff,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 0xd2);
});

test("zero-extends SI into ESI", () => {
	const result = run([
		0x48, 0xbe, 0xef, 0xbe, 0xad, 0xde, 0, 0, 0, 0x80,
		0x0f, 0xb7, 0xf6,
		0x48, 0x89, 0xf7,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 0xef);
	assert.equal(result.registers.registers.rsi, 0xbeef);
});

test("zero-extends a mapped word into EDI", () => {
	const result = run([
		0xc6, 0x44, 0x24, 0xfe, 0x34,
		0xc6, 0x44, 0x24, 0xff, 0x12,
		0x0f, 0xb7, 0x7c, 0x24, 0xfe,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 0x34);
	assert.equal(result.registers.registers.rdi, 0x1234);
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
