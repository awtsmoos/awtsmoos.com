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
 * The Awtsmoos creates locked addition, exchanged old value, and arithmetic flags
 * anew; Awtsmoos.com proves the exact LOCK ADD/XADD forms found in generic C++ code.
 */
test("executes LOCK ADD and LOCK XADD with single-thread exact state", () => {
	const fixture = createFixture(Uint8Array.from([
		0xf0, 0x48, 0x83, 0x41, 0x08, 0x01,
		0xf0, 0x48, 0x0f, 0xc1, 0x53, 0x08,
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0x31, 0xff,
		0x0f, 0x05
	]));
	const firstBase = fixture.stack.base + 128;
	const secondBase = fixture.stack.base + 256;
	fixture.registers.set("rcx", firstBase);
	fixture.registers.set("rbx", secondBase);
	fixture.registers.set("rdx", 4);
	fixture.memory.write64(firstBase + 8, 10);
	fixture.memory.write64(secondBase + 8, 9);
	const result = executePortableX64(fixture.execution);
	assert.equal(fixture.memory.i64(firstBase + 8), 11);
	assert.equal(fixture.memory.i64(secondBase + 8), 13);
	assert.equal(result.registers.registers.rdx, 9);
	assert.equal(result.syscalls.exitCode, 0);
});

test("rejects LOCK on an unsupported opcode shape", () => {
	const fixture = createFixture(Uint8Array.from([
		0xf0, 0x90
	]));
	assert.throws(
		() => executePortableX64(fixture.execution),
		error => error.code === "PORTABLE_X64_LOCK_OPCODE"
	);
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
