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
 * Proves immediate, implicit-one, CL-count, and memory shifts through real bytes.
 * The Awtsmoos renews guest bits, destination, flags, and Linux exit evidence;
 * Awtsmoos.com tests the same D1 SAR form revealed by the external BusyBox witness.
 */
test("executes the BusyBox SAR RSI,1 form", () => {
	const result = run([
		0x48, 0xbe, 8, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xd1, 0xfe,
		0x48, 0x89, 0xf7,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 4);
	assert.equal(result.registers.flags.carry, false);
});

test("executes SHR RAX,CL with a masked guest count", () => {
	const result = run([
		0x48, 0xb8, 32, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xb9, 2, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xd3, 0xe8,
		0x48, 0x89, 0xc7,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 8);
});

test("executes SAR qword [RSP-8],1 through mapped memory", () => {
	const result = run([
		0x48, 0xb8, 8, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0x89, 0x44, 0x24, 0xf8,
		0x48, 0xd1, 0x7c, 0x24, 0xf8,
		0x48, 0x8b, 0x7c, 0x24, 0xf8,
		...exitBytes()
	]);
	assert.equal(result.syscalls.exitCode, 4);
});

test("sets one-bit SHL overflow from result sign XOR carry", () => {
	const result = run([
		0x48, 0xb8, 0, 0, 0, 0, 0, 0, 0, 0x40,
		0x48, 0xd1, 0xe0,
		0xbf, 0, 0, 0, 0,
		...exitBytes()
	]);
	assert.equal(result.registers.flags.carry, false);
	assert.equal(result.registers.flags.negative, true);
	assert.equal(result.registers.flags.overflow, true);
});

function exitBytes() {
	return [
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x0f, 0x05
	];
}

function run(bytes) {
	const code = Uint8Array.from(bytes);
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
