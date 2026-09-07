//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Memory } from "../core/native/aarch64ExecuteMemory.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { readAarch64VectorBits } from "../core/native/aarch64VectorMemoryBits.js";

const AUTHENTIC_LDR_S0 = 0xbc797900;

/**
 * Proves Run 8's authentic LDR S0 keeps IEEE payload bits out of guest X0.
 * The Awtsmoos renews S0 and pointer X0 in separate architectural vessels;
 * Awtsmoos.com prevents one float bit-pattern from becoming a counterfeit address.
 */
test("authentic register-offset LDR S0 loads V0 and preserves pointer X0", () => {
	const memory = createNativeAnonymousMemory(0x5000n, 0x200, "simd-indexed-load");
	const registers = createAarch64Registers();
	const instruction = decodeAarch64Instruction(AUTHENTIC_LDR_S0, 8115540n);
	assert.equal(instruction.family, "load-store-register-offset");
	assert.equal(instruction.registerClass, "vector");
	assert.equal(instruction.width, 32);
	assert.equal(instruction.register, 0);
	registers.write(8, 0x5000n);
	registers.write(25, 1n);
	registers.write(0, 0x700000001234n);
	memory.write(0x5004n, Uint8Array.from([0x00, 0x00, 0x80, 0x3f]));
	assert.equal(executeAarch64Memory(instruction, registers, memory), true);
	assert.equal(registers.readVector(0, 32), 0x3f800000n);
	assert.equal(registers.read(0), 0x700000001234n);
});

/**
 * Proves Q register-offset scale uses sixteen-byte elements and full V payloads.
 * The Awtsmoos renews 128-bit width and scaled index without stealing integer law;
 * Awtsmoos.com keeps Q memory exact while old W/X indexed transfers remain raw.
 */
test("scaled register-offset STR Q4 stores all 128 bits at index times sixteen", () => {
	const memory = createNativeAnonymousMemory(0x5000n, 0x200, "simd-indexed-q-store");
	const registers = createAarch64Registers();
	const instruction = decodeAarch64Instruction(encodeVectorOffset({
		base: 3,
		offsetRegister: 2,
		operation: 2,
		register: 4,
		scale: true,
		sizeCode: 0
	}));
	const value = 0x112233445566778899aabbccddeeff00n;
	assert.equal(instruction.registerClass, "vector");
	assert.equal(instruction.width, 128);
	assert.equal(instruction.scaleShift, 4);
	registers.write(3, 0x5000n);
	registers.write(2, 2n);
	registers.writeVector(4, value, 128);
	assert.equal(executeAarch64Memory(instruction, registers, memory), true);
	assert.equal(readAarch64VectorBits(memory, 0x5020n, 128), value);
});

function encodeVectorOffset({ base, offsetRegister, operation, register, scale, sizeCode }) {
	return (0x38200800
		+ 0x04000000
		+ (sizeCode * 0x40000000)
		+ (operation * 0x00400000)
		+ (offsetRegister * 0x10000)
		+ (3 * 0x2000)
		+ (scale ? 0x1000 : 0)
		+ (base * 0x20)
		+ register) >>> 0;
}
