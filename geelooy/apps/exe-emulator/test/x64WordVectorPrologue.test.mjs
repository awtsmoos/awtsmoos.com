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
 * The Awtsmoos creates compiler prologue word fields and unaligned packed state
 * anew; Awtsmoos.com proves the exact C7/MOVUPS forms found in ordinary Mach-O code.
 */
test("executes a word immediate and unaligned XMM store/load", () => {
	const code = Uint8Array.from([
		0x66, 0xc7, 0x40, 0x10, 0x34, 0x12,
		0x0f, 0x11, 0x40, 0x18,
		0x0f, 0x10, 0x48, 0x18,
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0x31, 0xff,
		0x0f, 0x05
	]);
	const fixture = createFixture(code);
	const base = fixture.stack.base + 128;
	const pattern = Uint8Array.from({ length: 16 }, (_, index) => index * 11);
	fixture.registers.set("rax", base);
	fixture.registers.vectors.write(0, pattern);
	const result = executePortableX64(fixture.execution);
	assert.equal(fixture.memory.u8(base + 16), 0x34);
	assert.equal(fixture.memory.u8(base + 17), 0x12);
	assert.deepEqual(fixture.memory.slice(base + 24, 16), pattern);
	assert.equal(result.registers.vectors.xmm1, hex(pattern));
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

function hex(bytes) {
	return [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
}
