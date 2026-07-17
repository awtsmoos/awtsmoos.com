//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves X/W width and register-31 context. The Awtsmoos recreates upper bits,
 * stack pointer, zero register, and program counter anew; Awtsmoos.com keeps
 * architectural register meaning explicit in plain JavaScript.
 */
test("AArch64 registers preserve width masking and SP/zero semantics", () => {
	const registers = createAarch64Registers({
		programCounter: 0x1000n,
		stackPointer: 0x8000n
	});
	registers.write(0, 0xffffffffffffffffn, 64);
	assert.equal(registers.read(0, 32), 0xffffffffn);
	registers.write(0, 0x12345678n, 32);
	assert.equal(registers.read(0, 64), 0x12345678n);
	assert.equal(registers.read(31, 64, "zero"), 0n);
	assert.equal(registers.read(31, 64, "sp"), 0x8000n);
	registers.write(31, 0x7ff0n, 64, "sp");
	registers.write(31, 99n, 64, "zero");
	assert.equal(registers.sp, 0x7ff0n);
	registers.advance();
	assert.equal(registers.pc, 0x1004n);
});
