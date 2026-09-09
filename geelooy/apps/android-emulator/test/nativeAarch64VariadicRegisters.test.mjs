//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Verifies direct AAPCS64 variadic calls before a concrete va_list exists.
 * Integer and promoted-double arguments travel independently through X and V registers, then stack;
 * Awtsmoos.com keeps those ABI classes separate so libc formatting cannot silently reorder the guest.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAarch64VariadicRegisters } from "../core/native/nativeAarch64VariadicRegisters.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";

test("direct general variadics cross X registers then stack", () => {
	const memory = createNativeAnonymousMemory(0x8000n, 0x100, "variadic-stack");
	const registers = createAarch64Registers({ stackPointer: 0x8000n });
	for (let index = 2; index <= 7; index += 1) registers.write(index, BigInt(index));
	memory.write(0x8000n, integerBytes(8n));
	memory.write(0x8008n, integerBytes(9n));
	const reader = createNativeAarch64VariadicRegisters({ firstGeneral: 2, memory, registers });
	assert.deepEqual(Array.from({ length: 8 }, () => reader.nextGeneral()), [2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n]);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(reader.snapshot().stackSlots, 2);
});

test("direct floating variadics use V registers independently from X arguments", () => {
	const memory = createNativeAnonymousMemory(0x9000n, 0x100, "variadic-vector");
	const registers = createAarch64Registers({ stackPointer: 0x9000n });
	registers.write(3, 42n);
	registers.writeFloat(0, 1.5, 64);
	registers.writeFloat(1, -2.25, 64);
	const reader = createNativeAarch64VariadicRegisters({ firstGeneral: 3, memory, registers });
	assert.equal(reader.nextGeneral(), 42n);
	assert.equal(reader.nextFloating(), 1.5);
	assert.equal(reader.nextFloating(), -2.25);
	assert.deepEqual(reader.snapshot().consumed.map(entry => entry.kind), ["general", "floating", "floating"]);
});

test("floating spill reads double from the shared stack", () => {
	const memory = createNativeAnonymousMemory(0xa000n, 0x100, "variadic-float-stack");
	const registers = createAarch64Registers({ stackPointer: 0xa000n });
	memory.write(0xa000n, floatBytes(6.125));
	const reader = createNativeAarch64VariadicRegisters({ firstGeneral: 8, firstVector: 8, memory, registers });
	assert.equal(reader.nextFloating(), 6.125);
	assert.equal(reader.snapshot().stackSlots, 1);
});

/** Encodes one 64-bit general variadic spill slot in guest byte order. */
function integerBytes(value) {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setBigUint64(0, value, true);
	return bytes;
}

/** Encodes one promoted-double stack spill in guest byte order. */
function floatBytes(value) {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setFloat64(0, value, true);
	return bytes;
}
