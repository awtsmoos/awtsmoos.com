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
 * Proves every stack source becomes an exact architectural qword in guest memory.
 * The Awtsmoos renews register bits, signed immediates, stack depth, and return;
 * Awtsmoos.com never narrows or zero-extends where x86-64 declares preservation.
 */
test("round-trips an unsafe RCX value through PUSH and POP", () => {
	const value = 0x8123456789abcdefn;
	const immediate = new Uint8Array(8);
	new DataView(immediate.buffer).setBigUint64(0, value, true);
	const result = run([
		0x48, 0xb9, ...immediate,
		0x51,
		0x48, 0x31, 0xc9,
		0x5a,
		0xc3
	]);
	assert.equal(result.registers.registers.rcx, 0);
	assert.equal(result.registers.registers.rdx, "0x8123456789abcdef");
	assert.equal(result.registers.stackDepth, 0);
});

test("sign-extends PUSH imm8 into a full qword", () => {
	const result = run([
		0x6a, 0x80,
		0x5a,
		0xc3
	]);
	assert.equal(result.registers.registers.rdx, -128);
});

test("sign-extends PUSH imm32 into a full qword", () => {
	const result = run([
		0x68, 0x00, 0x00, 0x00, 0x80,
		0x5a,
		0xc3
	]);
	assert.equal(result.registers.registers.rdx, -2147483648);
});

function run(code) {
	const stack = createPortableStack({ stackSize: 4096 });
	const memory = new PortableByteMemory([
		{
			address: 0x1000,
			bytes: Uint8Array.from(code),
			flags: { execute: true, read: true },
			name: "code"
		},
		stack.segment
	], { maximumBytes: 8192 });
	return executePortableX64({
		limit: 32,
		memory,
		registers: new PortableRegisterFile(0x1000, {
			memory,
			stackBase: stack.base,
			stackTop: stack.top
		}),
		syscalls: createPortableSyscallHost("linux-x86-64", {})
	});
}
