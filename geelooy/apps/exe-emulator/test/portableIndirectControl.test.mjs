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
 * The Awtsmoos creates indirect slot, target, immediate stack value, and departure
 * anew. Awtsmoos.com proves generic FF control flow through real guest memory while
 * refusing mapped-but-non-executable and unresolved loader targets.
 */
test("executes memory-indirect jump and immediate push", () => {
	const code = new Uint8Array(0x80);
	code.set([0xff, 0x25, 0x0a, 0, 0, 0], 0);
	new DataView(code.buffer).setBigUint64(0x10, 0x1020n, true);
	code.set([
		0x68, 7, 0, 0, 0,
		0x58,
		0x48, 0xbf, 41, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x0f, 0x05
	], 0x20);
	const result = executeFixture(code);
	assert.equal(result.syscalls.exitCode, 41);
	assert.equal(result.registers.stackDepth, 0);
	assert.equal(result.steps, 6);
});

test("rejects indirect jumps into non-executable memory", () => {
	const code = new Uint8Array(0x40);
	code.set([0xff, 0x25, 0x0a, 0, 0, 0], 0);
	new DataView(code.buffer).setBigUint64(0x10, 0x2000n, true);
	assert.throws(
		() => executeFixture(code, [{
			address: 0x2000,
			bytes: new Uint8Array(16),
			flags: { read: true, write: true },
			name: "data"
		}]),
		error => error.code === "PORTABLE_INDIRECT_TARGET_NOT_EXECUTABLE"
	);
});

test("rejects unresolved indirect targets", () => {
	const code = new Uint8Array(0x40);
	code.set([0xff, 0x25, 0x0a, 0, 0, 0], 0);
	new DataView(code.buffer).setBigUint64(0x10, 0x77770000n, true);
	assert.throws(
		() => executeFixture(code),
		error => error.code === "PORTABLE_INDIRECT_TARGET_UNMAPPED"
	);
});

function executeFixture(code, extraSegments = []) {
	const stack = createPortableStack({ stackSize: 4096 });
	const memory = new PortableByteMemory([
		{
			address: 0x1000,
			bytes: code,
			flags: { execute: true, read: true },
			name: "code"
		},
		...extraSegments,
		stack.segment
	], { maximumBytes: 12288 });
	const registers = new PortableRegisterFile(0x1000, {
		memory,
		stackBase: stack.base,
		stackTop: stack.top
	});
	return executePortableX64({
		limit: 100,
		memory,
		registers,
		syscalls: createPortableSyscallHost("linux-x86-64", {})
	});
}
