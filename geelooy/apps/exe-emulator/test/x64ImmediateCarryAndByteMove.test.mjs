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
 * Proves byte-immediate MOV and immediate ADC/SBB across register and memory roads.
 * The Awtsmoos renews R14B, AH, carry, sign extension, destination, and flags;
 * Awtsmoos.com executes the exact BusyBox forms without applet-specific shortcuts.
 */
test("executes BusyBox MOV R14B,1 while preserving upper bits", () => {
	const runtime = run([
		0x49, 0xbe, 0xef, 0xcd, 0xab, 0x89, 0x67, 0x45, 0x23, 0x81,
		0x41, 0xb6, 0x01,
		0xc3
	]);
	assert.equal(
		runtime.registers.getUnsignedBigInt("r14"),
		0x8123456789abcd01n
	);
});

test("executes legacy MOV AH,imm8 without changing other RAX bits", () => {
	const runtime = run([
		0x48, 0xb8, 0xef, 0xcd, 0xab, 0x89, 0x67, 0x45, 0x23, 0x81,
		0xb4, 0x12,
		0xc3
	]);
	assert.equal(
		runtime.registers.getUnsignedBigInt("rax"),
		0x8123456789ab12efn
	);
});

test("executes BusyBox ADC RDI,0 with incoming carry", () => {
	const runtime = run([
		0xbf, 5, 0, 0, 0,
		0xbe, 0, 0, 0, 0,
		0x83, 0xfe, 0x01,
		0x48, 0x83, 0xd7, 0x00,
		0xc3
	]);
	assert.equal(runtime.registers.getUnsignedBigInt("rdi"), 6n);
	assert.equal(runtime.registers.flags.carry, false);
});

test("executes SBB EAX,imm8 with incoming borrow", () => {
	const runtime = run([
		0xb8, 5, 0, 0, 0,
		0xbe, 0, 0, 0, 0,
		0x83, 0xfe, 0x01,
		0x83, 0xd8, 0x02,
		0xc3
	]);
	assert.equal(runtime.registers.getUnsignedBigInt("rax"), 2n);
});

test("executes ADC dword [RDI],imm8", () => {
	const runtime = run([
		0xbf, 0x00, 0x20, 0, 0,
		0xbe, 0, 0, 0, 0,
		0x83, 0xfe, 0x01,
		0x83, 0x17, 0x02,
		0xc3
	], 3);
	assert.equal(runtime.memory.u32(DATA_ADDRESS), 6);
});

test("executes ADC AL,imm8 with carry and wrap", () => {
	const runtime = run([
		0xb0, 0xff,
		0xbe, 0, 0, 0, 0,
		0x83, 0xfe, 0x01,
		0x80, 0xd0, 0x00,
		0xc3
	]);
	assert.equal(runtime.registers.getUnsignedBigInt("rax"), 0n);
	assert.equal(runtime.registers.flags.carry, true);
});

function run(code, dataValue = 0) {
	const stack = createPortableStack({ stackSize: 4096 });
	const data = new Uint8Array(32);
	new DataView(data.buffer).setUint32(0, dataValue, true);
	const memory = new PortableByteMemory([
		{ address: 0x1000, bytes: Uint8Array.from(code), flags: { execute: true, read: true }, name: "code" },
		{ address: DATA_ADDRESS, bytes: data, flags: { read: true, write: true }, name: "data" },
		stack.segment
	], { maximumBytes: 16384 });
	const registers = new PortableRegisterFile(0x1000, {
		memory,
		stackBase: stack.base,
		stackTop: stack.top
	});
	executePortableX64({
		limit: 100,
		memory,
		registers,
		syscalls: createPortableSyscallHost("linux-x86-64", {})
	});
	return { memory, registers };
}
