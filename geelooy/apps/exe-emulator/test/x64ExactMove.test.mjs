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
 * Proves register MOV preserves exact bits and zero-extends a 32-bit destination.
 * The Awtsmoos renews R12, ESI, RSI, high-bit testimony, and process departure;
 * Awtsmoos.com tests the same MOV ESI,R12D form revealed by BusyBox startup.
 */
test("executes BusyBox MOV ESI,R12D with exact source masking", () => {
	const result = run([
		0x49, 0xbc, 0x78, 0x56, 0x34, 0x12, 0, 0, 0, 0x80,
		0x44, 0x89, 0xe6,
		0x48, 0x89, 0xf7,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 0x78);
	assert.equal(result.registers.registers.rsi, 0x12345678);
});

test("executes 64-bit MOV without narrowing high bits", () => {
	const result = run([
		0x48, 0xbe, 0xef, 0xcd, 0xab, 0x89, 0x67, 0x45, 0x23, 0x81,
		0x48, 0x89, 0xf7,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 0xef);
	assert.equal(
		result.registers.registers.rdi,
		"0x8123456789abcdef"
	);
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
