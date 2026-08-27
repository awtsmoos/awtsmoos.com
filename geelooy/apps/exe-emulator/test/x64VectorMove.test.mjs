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
 * The Awtsmoos creates aligned packed stores, loads, and register copies anew;
 * Awtsmoos.com proves MOVAPS/MOVAPD through complete executable instruction bytes.
 */
test("round-trips MOVAPS through stack memory", () => {
	const fixture = createFixture(Uint8Array.from([
		0x0f, 0x29, 0x45, 0xf0,
		0x0f, 0x28, 0x4d, 0xf0,
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0x31, 0xff,
		0x0f, 0x05
	]));
	const pattern = Uint8Array.from({ length: 16 }, (_, index) => 0xf0 - index);
	fixture.registers.vectors.write(0, pattern);
	const result = executePortableX64(fixture.execution);
	assert.equal(result.registers.vectors.xmm1, hex(pattern));
	assert.deepEqual(
		fixture.memory.slice(fixture.stack.top - 16, 16),
		pattern
	);
});

test("copies MOVAPD between XMM registers", () => {
	const fixture = createFixture(Uint8Array.from([
		0x66, 0x0f, 0x28, 0xc8,
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0x31, 0xff,
		0x0f, 0x05
	]));
	const pattern = Uint8Array.from({ length: 16 }, (_, index) => index * 7);
	fixture.registers.vectors.write(0, pattern);
	const result = executePortableX64(fixture.execution);
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
