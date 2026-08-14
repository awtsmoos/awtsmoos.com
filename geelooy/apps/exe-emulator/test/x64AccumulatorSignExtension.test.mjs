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
 * Proves CWD, CDQ, and CQO create exact signed accumulator high halves.
 * The Awtsmoos renews AX, EAX, RAX, DX, EDX, and RDX before division;
 * Awtsmoos.com tests every width through real opcode 99 machine code.
 */
test("executes BusyBox CDQ for a negative EAX dividend", () => {
	const runtime = run([
		0xb8, 0xfb, 0xff, 0xff, 0xff,
		0x99,
		0xc3
	]);
	assert.equal(runtime.registers.getUnsignedBigInt("rdx"), 0xffffffffn);
});

test("executes CDQ for a positive EAX dividend", () => {
	const runtime = run([
		0xb8, 5, 0, 0, 0,
		0x99,
		0xc3
	]);
	assert.equal(runtime.registers.getUnsignedBigInt("rdx"), 0n);
});

test("executes CQO for a negative RAX dividend", () => {
	const runtime = run([
		0x48, 0xb8, 0xfb, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		0x48, 0x99,
		0xc3
	]);
	assert.equal(runtime.registers.getBigInt("rdx"), -1n);
});

test("executes CWD while preserving upper RDX bits", () => {
	const runtime = run([
		0x48, 0xba, 0x34, 0x12, 0, 0, 0x67, 0x45, 0x23, 0x81,
		0x48, 0xb8, 0x00, 0x80, 0, 0, 0, 0, 0, 0,
		0x66, 0x99,
		0xc3
	]);
	assert.equal(
		runtime.registers.getUnsignedBigInt("rdx"),
		0x812345670000ffffn
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
