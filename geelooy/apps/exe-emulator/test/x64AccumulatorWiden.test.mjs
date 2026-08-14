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
 * Proves CBW, CWDE, and CDQE widen signed low-accumulator values exactly.
 * The Awtsmoos renews AL, AX, EAX, RAX, preserved bits, and compiler widening;
 * Awtsmoos.com tests every opcode 98 width through real machine code.
 */
test("executes BusyBox CDQE from negative EAX", () => {
	const runtime = run([
		0xb8, 0xff, 0xff, 0xff, 0xff,
		0x48, 0x98,
		0xc3
	]);
	assert.equal(runtime.registers.getBigInt("rax"), -1n);
});

test("executes CWDE with architectural dword zero extension", () => {
	const runtime = run([
		0x48, 0xb8, 0x00, 0x80, 0, 0, 0x67, 0x45, 0x23, 0x81,
		0x98,
		0xc3
	]);
	assert.equal(runtime.registers.getUnsignedBigInt("rax"), 0xffff8000n);
});

test("executes CBW while preserving upper RAX bits", () => {
	const runtime = run([
		0x48, 0xb8, 0x80, 0x12, 0, 0, 0x67, 0x45, 0x23, 0x81,
		0x66, 0x98,
		0xc3
	]);
	assert.equal(
		runtime.registers.getUnsignedBigInt("rax"),
		0x812345670000ff80n
	);
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
	const registers = new PortableRegisterFile(0x1000, {
		memory,
		stackBase: stack.base,
		stackTop: stack.top
	});
	executePortableX64({
		limit: 32,
		memory,
		registers,
		syscalls: createPortableSyscallHost("linux-x86-64", {})
	});
	return { memory, registers };
}
