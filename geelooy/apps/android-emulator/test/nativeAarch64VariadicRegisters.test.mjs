//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAarch64VariadicRegisters } from "../core/native/nativeAarch64VariadicRegisters.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";

test("direct variadic arguments cross X registers then stack slots", () => {
	const memory = createNativeAnonymousMemory(0x8000n, 0x100, "variadic-stack");
	const registers = createAarch64Registers({ stackPointer: 0x8000n });
	for (let index = 2; index <= 7; index += 1) registers.write(index, BigInt(index));
	memory.write(0x8000n, pointerBytes(8n));
	memory.write(0x8008n, pointerBytes(9n));
	const reader = createNativeAarch64VariadicRegisters({
		firstGeneral: 2,
		memory,
		registers
	});
	assert.deepEqual(
		Array.from({ length: 8 }, () => reader.nextGeneral()),
		[2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n]
	);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(reader.snapshot().consumed[6].source, "32768");
});

test("thirty-two-bit reads narrow register and stack values", () => {
	const memory = createNativeAnonymousMemory(0x9000n, 0x20, "variadic-stack");
	const registers = createAarch64Registers({ stackPointer: 0x9000n });
	registers.write(7, 0xabcdef0180000001n);
	memory.write(0x9000n, pointerBytes(0xffffffff12345678n));
	const reader = createNativeAarch64VariadicRegisters({
		firstGeneral: 7,
		memory,
		registers
	});
	assert.equal(reader.nextGeneral(32), 0x80000001n);
	assert.equal(reader.nextGeneral(32), 0x12345678n);
});

function pointerBytes(value) {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setBigUint64(0, value, true);
	return bytes;
}
