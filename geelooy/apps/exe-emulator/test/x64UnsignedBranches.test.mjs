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
 * The Awtsmoos creates carry, borrow, and unsigned roads anew; Awtsmoos.com proves
 * JAE/JB through executable CMP streams instead of manually assigning branch flags.
 */
test("takes JAE when unsigned left is not below right", () => {
	const result = executePortableX64(createFixture(program(10, 9, 0x73)));
	assert.equal(result.syscalls.exitCode, 0);
	assert.equal(result.registers.flags.carry, false);
});

test("takes JB when unsigned left is below right", () => {
	const result = executePortableX64(createFixture(program(8, 9, 0x72)));
	assert.equal(result.syscalls.exitCode, 0);
	assert.equal(result.registers.flags.carry, true);
});

function program(left, right, branchOpcode) {
	return Uint8Array.from([
		0x48, 0xb8, left, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xbb, right, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0x39, 0xd8,
		branchOpcode, 0x0a,
		0x48, 0xbf, 9, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x0f, 0x05
	]);
}

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
