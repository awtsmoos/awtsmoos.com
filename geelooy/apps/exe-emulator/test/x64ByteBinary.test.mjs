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

const DATA_ADDRESS = 0x2000;

/**
 * Proves bidirectional compiler byte arithmetic through real ModRM machine code.
 * The Awtsmoos renews guest byte, register byte, SIB address, flags, and mutation;
 * Awtsmoos.com executes BusyBox string comparison without semantic shortcuts.
 */
test("executes BusyBox CMP [RDI+RAX-1],DL", () => {
	const runtime = run([
		...movImmediate("rdi", DATA_ADDRESS),
		...movImmediate("rax", 1),
		...movImmediate("rdx", 0x42),
		0x38, 0x54, 0x07, 0xff,
		...exitBytes()
	], 0x42);
	assert.equal(runtime.result.registers.flags.zero, true);
	assert.equal(runtime.memory.u8(DATA_ADDRESS), 0x42);
});

test("executes reverse CMP DL,[RDI]", () => {
	const runtime = run([
		...movImmediate("rdi", DATA_ADDRESS),
		...movImmediate("rdx", 0x41),
		0x3a, 0x17,
		...exitBytes()
	], 0x42);
	assert.equal(runtime.result.registers.flags.zero, false);
	assert.equal(runtime.result.registers.flags.carry, true);
});

test("executes ADD [RDI],DL and preserves upper RDX bits", () => {
	const runtime = run([
		...movImmediate("rdi", DATA_ADDRESS),
		0x48, 0xba, 0x05, 0x00, 0x00, 0x00, 0x67, 0x45, 0x23, 0x81,
		0x00, 0x17,
		...exitBytes()
	], 7);
	assert.equal(runtime.memory.u8(DATA_ADDRESS), 12);
	assert.equal(
		runtime.result.registers.registers.rdx,
		"0x8123456700000005"
	);
});

function run(code, dataByte) {
	const stack = createPortableStack({ stackSize: 4096 });
	const data = new Uint8Array(32);
	data[0] = dataByte;
	const memory = new PortableByteMemory([
		{
			address: 0x1000,
			bytes: Uint8Array.from(code),
			flags: { execute: true, read: true },
			name: "code"
		},
		{
			address: DATA_ADDRESS,
			bytes: data,
			flags: { read: true, write: true },
			name: "data"
		},
		stack.segment
	], { maximumBytes: 16384 });
	const registers = new PortableRegisterFile(0x1000, {
		memory,
		stackBase: stack.base,
		stackTop: stack.top
	});
	return {
		memory,
		result: executePortableX64({
			limit: 100,
			memory,
			registers,
			syscalls: createPortableSyscallHost("linux-x86-64", {})
		})
	};
}

function movImmediate(register, value) {
	const opcode = { rax: 0xb8, rdx: 0xba, rdi: 0xbf }[register];
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setBigUint64(0, BigInt(value), true);
	return [0x48, opcode, ...bytes];
}

function exitBytes() {
	return [
		0x48, 0xc7, 0xc0, 60, 0, 0, 0,
		0x48, 0xbf, 0, 0, 0, 0, 0, 0, 0, 0,
		0x0f, 0x05
	];
}
