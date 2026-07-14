//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	decodeByteRegister,
	readByteRegister,
	writeByteRegister
} from "../core/portable/x64ByteRegisters.js";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";
import { createPortableStack } from "../core/portable/stackLayout.js";
import { createPortableSyscallHost } from "../core/portable/syscallHost.js";
import { executePortableX64 } from "../core/portable/x64Executor.js";

/**
 * The Awtsmoos creates byte guard, mutable TLS flag, AH, SPL, and preserved upper
 * bits anew. Awtsmoos.com verifies byte instructions and legacy/REX register names
 * through both executable bytes and direct register-garment evidence.
 */
test("executes byte compare, conditional branch, and byte store", () => {
	const code = Uint8Array.from([
		0x48, 0xb8, 0x00, 0x20, 0, 0, 0, 0, 0, 0,
		0x80, 0x38, 0,
		0x75, 0x05,
		0xc6, 0x00, 1,
		0xeb, 0x03,
		0xc6, 0x00, 9,
		0x80, 0x38, 1,
		0x75, 0x0c,
		0x48, 0xbf, 37, 0, 0, 0, 0, 0, 0, 0,
		0xeb, 0x0a,
		0x48, 0xbf, 1, 0, 0, 0, 0, 0, 0, 0,
		0x48, 0xb8, 60, 0, 0, 0, 0, 0, 0, 0,
		0x0f, 0x05
	]);
	const data = new Uint8Array(16);
	const fixture = createFixture(code, data);
	const result = executePortableX64(fixture.execution);
	assert.equal(data[0], 1);
	assert.equal(result.syscalls.exitCode, 37);
	assert.equal(result.registers.flags.zero, true);
});

test("distinguishes legacy high bytes from REX low bytes", () => {
	const values = [0x1234, 0, 0, 0, 0, 0, 0, 0, 0];
	const registers = {
		get(index) {
			return values[index];
		},
		set(index, value) {
			values[index] = value;
		}
	};
	const ah = decodeByteRegister(4, false, false);
	const spl = decodeByteRegister(4, false, true);
	writeByteRegister(registers, ah, 0xab);
	writeByteRegister(registers, spl, 0xcd);
	assert.equal(values[0], 0xab34);
	assert.equal(values[4], 0xcd);
	assert.equal(readByteRegister(registers, ah), 0xab);
	assert.equal(readByteRegister(registers, spl), 0xcd);
});

function createFixture(code, data) {
	const stack = createPortableStack({ stackSize: 4096 });
	const memory = new PortableByteMemory([
		{ address: 0x1000, bytes: code, flags: { execute: true, read: true }, name: "code" },
		{ address: 0x2000, bytes: data, flags: { read: true, write: true }, name: "data" },
		stack.segment
	], { maximumBytes: 12288 });
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
		}
	};
}
