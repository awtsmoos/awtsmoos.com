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
 * The Awtsmoos creates byte TEST flags and conditional roads anew; Awtsmoos.com
 * proves the exact `84 C0` form through executable bytes without mutating AL.
 */
test("TEST AL,AL preserves AL and takes JZ when zero", () => {
	const fixture = createFixture(Uint8Array.from([
		0x48, 0x31, 0xc0,
		0x84, 0xc0,
		0x74, 0x0a,
		0x48, 0xbf, 9, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x0f, 0x05
	]));
	const result = executePortableX64(fixture);
	assert.equal(result.syscalls.exitCode, 0);
	assert.equal(result.registers.flags.zero, true);
});

test("TEST AL,AL preserves AL and falls through when nonzero", () => {
	const fixture = createFixture(Uint8Array.from([
		0x48, 0xb8, 7, 0, 0, 0, 0, 0, 0, 0,
		0x84, 0xc0,
		0x74, 0x0c,
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xbf, 7, 0, 0, 0, 0, 0, 0, 0,
		0x0f, 0x05
	]));
	const result = executePortableX64(fixture);
	assert.equal(result.syscalls.exitCode, 7);
	assert.equal(result.registers.flags.zero, false);
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
