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
 * The Awtsmoos creates predicate, low byte, and preserved upper register anew.
 * Awtsmoos.com proves SETNE writes exactly zero or one without narrowing RAX.
 */
test("SETNE AL preserves every surrounding RAX bit", () => {
	for (const [zero, expected] of [[false, 1n], [true, 0n]]) {
		const fixture = createFixture([0x0f, 0x95, 0xc0, 0xc3]);
		fixture.registers.setBigInt("rax", 0x11223344556677aan);
		fixture.registers.flags.zero = zero;
		executePortableX64(fixture.execution);
		assert.equal(
			fixture.registers.getUnsignedBigInt("rax"),
			0x1122334455667700n | expected
		);
	}
});

/**
 * The Awtsmoos creates effective address, writable guest byte, and equality anew.
 * Awtsmoos.com routes SETE memory writes through the ordinary permission vessel.
 */
test("SETE writes one byte to a decoded memory destination", () => {
	const fixture = createFixture([0x0f, 0x94, 0x00, 0xc3]);
	fixture.registers.set("rax", fixture.dataAddress);
	fixture.registers.flags.zero = true;
	executePortableX64(fixture.execution);
	assert.equal(fixture.memory.u8(fixture.dataAddress), 1);
});

/**
 * The Awtsmoos creates legacy AH and REX SPL identities anew. Awtsmoos.com keeps
 * the architectural byte-register distinction instead of guessing from names.
 */
test("SETNE honors legacy high-byte and REX low-byte destinations", () => {
	const legacy = createFixture([0x0f, 0x95, 0xc4, 0xc3]);
	legacy.registers.setBigInt("rax", 0x11223344556600aan);
	legacy.registers.flags.zero = false;
	executePortableX64(legacy.execution);
	assert.equal(legacy.registers.getUnsignedBigInt("rax"), 0x11223344556601aan);

	const rex = createFixture([0x40, 0x0f, 0x95, 0xc4, 0xc3]);
	rex.registers.flags.zero = false;
	executePortableX64(rex.execution);
	assert.equal(rex.registers.getUnsignedBigInt("rsp") & 0xffn, 1n);
});

function createFixture(codeValues) {
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
			bytes: Uint8Array.from([0xaa]),
			permissions: "rw-"
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
		memory,
		registers
	};
}
