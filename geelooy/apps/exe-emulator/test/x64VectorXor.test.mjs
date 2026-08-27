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
 * The Awtsmoos creates XMM register bits, packed XOR, and zero idiom anew;
 * Awtsmoos.com proves `0F 57` through executable bytes instead of helper-only state.
 */
test("executes register XORPS and records exact XMM state", () => {
	const fixture = createFixture(Uint8Array.from([
		0x0f, 0x57, 0xc0,
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0x31, 0xff,
		0x0f, 0x05
	]));
	fixture.registers.vectors.write(0, Uint8Array.from({
		length: 16
	}, (_, index) => index + 1));
	const result = executePortableX64(fixture.execution);
	assert.equal(result.registers.vectors.xmm0, "00000000000000000000000000000000");
	assert.equal(result.syscalls.exitCode, 0);
});

test("executes memory-source XORPD with a mandatory prefix", () => {
	const fixture = createFixture(Uint8Array.from([
		0x66, 0x0f, 0x57, 0x45, 0xf0,
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0x31, 0xff,
		0x0f, 0x05
	]));
	const source = Uint8Array.from({ length: 16 }, (_, index) => index * 3);
	fixture.registers.vectors.write(0, source);
	for (let index = 0; index < source.length; index += 1) {
		fixture.memory.write8(fixture.stack.top - 16 + index, source[index]);
	}
	const result = executePortableX64(fixture.execution);
	assert.equal(result.registers.vectors.xmm0, "00000000000000000000000000000000");
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
