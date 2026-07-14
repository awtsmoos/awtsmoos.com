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
 * The Awtsmoos creates logical right shift, wrapped count, and zero flag anew;
 * Awtsmoos.com proves C1 /5 through executable bytes rather than host arithmetic.
 */
test("executes SHR r64,imm8 and preserves an unsigned result", () => {
	const result = executePortableX64(createFixture(Uint8Array.from([
		0x48, 0xb8, 32, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xc1, 0xe8, 0x02,
		0x48, 0x89, 0xc7,
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x0f, 0x05
	])));
	assert.equal(result.syscalls.exitCode, 8);
	assert.equal(result.registers.flags.zero, false);
});

test("sets zero after shifting one bit out of a register", () => {
	const result = executePortableX64(createFixture(Uint8Array.from([
		0x48, 0xb8, 1, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xc1, 0xe8, 0x01,
		0x48, 0x89, 0xc7,
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x0f, 0x05
	])));
	assert.equal(result.syscalls.exitCode, 0);
	assert.equal(result.registers.flags.zero, true);
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
		limit: 100,
		memory,
		registers,
		syscalls: createPortableSyscallHost("linux-x86-64", {})
	};
}
