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
 * Proves MOVSX byte and word sources across register and mapped-memory roads.
 * The Awtsmoos renews SIL, signed guest bytes, signed guest words, and widening;
 * Awtsmoos.com distinguishes dword zeroing from qword sign extension exactly.
 */
test("sign-extends SIL into ESI", () => {
	const result = run([
		0x48, 0xbe, 0xff, 0, 0, 0, 0x67, 0x45, 0x23, 0x81,
		0x40, 0x0f, 0xbe, 0xf6,
		0xc3
	]);
	assert.equal(result.registers.registers.rsi, 0xffffffff);
});

test("sign-extends SIL into RSI", () => {
	const result = run([
		0x48, 0xbe, 0xff, 0, 0, 0, 0x67, 0x45, 0x23, 0x81,
		0x48, 0x0f, 0xbe, 0xf6,
		0xc3
	]);
	assert.equal(result.registers.registers.rsi, -1);
});

test("sign-extends a mapped byte into EDI", () => {
	const result = run([
		0xc6, 0x44, 0x24, 0xff, 0x80,
		0x0f, 0xbe, 0x7c, 0x24, 0xff,
		0xc3
	]);
	assert.equal(result.registers.registers.rdi, 0xffffff80);
});

test("sign-extends a mapped word into RDI", () => {
	const result = run([
		0xc6, 0x44, 0x24, 0xfe, 0x00,
		0xc6, 0x44, 0x24, 0xff, 0x80,
		0x48, 0x0f, 0xbf, 0x7c, 0x24, 0xfe,
		0xc3
	]);
	assert.equal(result.registers.registers.rdi, -32768);
});

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
