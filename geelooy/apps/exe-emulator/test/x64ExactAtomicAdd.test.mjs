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
 * The Awtsmoos creates locked memory, exact source bits, wrapped sum, and flags
 * anew. Awtsmoos.com proves single-thread LOCK ADD preserves the full qword while
 * making no claim about host-thread scheduling or cross-worker atomicity.
 */
test("LOCK ADD memory/register preserves an unsafe exact source", () => {
	const fixture = createFixture();
	const address = fixture.stack.base + 128;
	fixture.registers.set("rax", address - 0x18);
	fixture.registers.setBigInt("rbx", 0x0fffffffffffffffn);
	fixture.memory.write64BigInt(address, 1n);
	const result = executePortableX64(fixture.execution);
	assert.equal(
		fixture.memory.u64BigInt(address),
		0x1000000000000000n
	);
	assert.equal(
		fixture.registers.getUnsignedBigInt("rbx"),
		0x0fffffffffffffffn
	);
	assert.deepEqual(result.registers.flags, {
		carry: false,
		negative: false,
		overflow: false,
		zero: false
	});
});

test("LOCK ADD qword wraps and reports carry", () => {
	const fixture = createFixture();
	const address = fixture.stack.base + 256;
	fixture.registers.set("rax", address - 0x18);
	fixture.registers.setBigInt("rbx", 0x20n);
	fixture.memory.write64BigInt(address, 0xfffffffffffffff0n);
	const result = executePortableX64(fixture.execution);
	assert.equal(fixture.memory.u64BigInt(address), 0x10n);
	assert.equal(result.registers.flags.carry, true);
	assert.equal(result.registers.flags.zero, false);
});

function createFixture() {
	const stack = createPortableStack({ stackSize: 4096 });
	const code = Uint8Array.from([
		0xf0, 0x48, 0x01, 0x58, 0x18,
		0xc3
	]);
	const memory = new PortableByteMemory([
		{
			address: 0x1000,
			bytes: code,
			permissions: "r-x"
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
			limit: 16,
			memory,
			registers,
			syscalls: createPortableSyscallHost("linux-x86-64", {})
		},
		memory,
		registers,
		stack
	};
}
