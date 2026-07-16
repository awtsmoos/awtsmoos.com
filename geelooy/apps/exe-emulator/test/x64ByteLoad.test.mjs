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
 * The Awtsmoos creates memory byte, direct byte, destination register, and every
 * preserved surrounding bit anew. Awtsmoos.com proves MOV r8,r/m8 never narrows
 * the containing sixty-four-bit register while decoding ModRM and REX extensions.
 */
test("MOV CL from memory preserves the surrounding exact RCX bits", () => {
	const fixture = createFixture([0x8a, 0x08, 0xc3], 0x41);
	fixture.registers.set("rax", fixture.dataAddress);
	fixture.registers.setBigInt("rcx", 0x1122334455667700n);
	executePortableX64(fixture.execution);
	assert.equal(
		fixture.registers.getUnsignedBigInt("rcx"),
		0x1122334455667741n
	);
});

test("REX MOV R8B from memory preserves the surrounding exact bits", () => {
	const fixture = createFixture([0x44, 0x8a, 0x00, 0xc3], 0x7f);
	fixture.registers.set("rax", fixture.dataAddress);
	fixture.registers.setBigInt("r8", 0xffffffffffff0000n);
	executePortableX64(fixture.execution);
	assert.equal(
		fixture.registers.getUnsignedBigInt("r8"),
		0xffffffffffff007fn
	);
});

test("direct MOV CL from AL uses byte-register semantics", () => {
	const fixture = createFixture([0x8a, 0xc8, 0xc3], 0);
	fixture.registers.setBigInt("rax", 0x88776655443322aan);
	fixture.registers.setBigInt("rcx", 0x1122334455667700n);
	executePortableX64(fixture.execution);
	assert.equal(
		fixture.registers.getUnsignedBigInt("rcx"),
		0x11223344556677aan
	);
});

function createFixture(codeValues, dataValue) {
	const codeAddress = 0x1000;
	const dataAddress = 0x2000;
	const stack = createPortableStack({ stackSize: 4096 });
	const memory = new PortableByteMemory([
		{
			address: codeAddress,
			bytes: Uint8Array.from(codeValues),
			permissions: "r-x"
		},
		{
			address: dataAddress,
			bytes: Uint8Array.from([dataValue]),
			permissions: "r--"
		},
		stack.segment
	], { maximumBytes: 8192 });
	const registers = new PortableRegisterFile(codeAddress, {
		memory,
		stackBase: stack.base,
		stackTop: stack.top
	});
	return {
		dataAddress,
		execution: {
			limit: 16,
			memory,
			registers,
			syscalls: createPortableSyscallHost("linux-x86-64", {})
		},
		registers
	};
}
