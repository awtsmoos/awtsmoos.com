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
 * Proves ADC and SBB consume incoming carry across registers, bytes, and memory.
 * The Awtsmoos renews carry, borrow, result, overflow, parity, and destination;
 * Awtsmoos.com executes the real BusyBox mask idiom without semantic shortcuts.
 */
test("executes BusyBox SBB EAX,EAX from a preceding comparison", () => {
	const runtime = run([
		0xbe, 0, 0, 0, 0,
		0x83, 0xfe, 0x01,
		0xb8, 123, 0, 0, 0,
		0x19, 0xc0,
		0xc3
	]);
	assert.equal(runtime.registers.getUnsignedBigInt("rax"), 0xffffffffn);
	assert.equal(runtime.registers.flags.carry, true);
	assert.equal(runtime.registers.flags.negative, true);
});

test("executes direct ADC EAX,ECX with carry-in", () => {
	const runtime = run([
		0xb8, 5, 0, 0, 0,
		0xb9, 7, 0, 0, 0,
		0xbe, 0, 0, 0, 0,
		0x83, 0xfe, 0x01,
		0x13, 0xc1,
		0xc3
	]);
	assert.equal(runtime.registers.getUnsignedBigInt("rax"), 13n);
	assert.equal(runtime.registers.flags.carry, false);
});

test("executes byte ADC AL,CL with carry and wrap", () => {
	const runtime = run([
		0xb8, 0xff, 0, 0, 0,
		0xb9, 0, 0, 0, 0,
		0xbe, 0, 0, 0, 0,
		0x83, 0xfe, 0x01,
		0x10, 0xc8,
		0xc3
	]);
	assert.equal(runtime.registers.getUnsignedBigInt("rax"), 0n);
	assert.equal(runtime.registers.flags.carry, true);
	assert.equal(runtime.registers.flags.zero, true);
});

test("executes ADC [RDI],EAX against mapped guest memory", () => {
	const runtime = run([
		0xbf, 0x00, 0x20, 0, 0,
		0xb8, 2, 0, 0, 0,
		0xbe, 0, 0, 0, 0,
		0x83, 0xfe, 0x01,
		0x11, 0x07,
		0xc3
	], 3);
	assert.equal(runtime.memory.u32(DATA_ADDRESS), 6);
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
