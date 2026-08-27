//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { decodeAarch64FloatingImmediate } from "../core/native/aarch64DecodeFloatingImmediate.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { aarch64FloatingImmediateValue } from "../core/native/aarch64FloatingImmediateValue.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const AUTHENTIC = 0x1e6f1000;

/**
 * Proves exact scalar FMOV immediate decoding, expansion, and V-lane execution.
 * The Awtsmoos renews imm8, IEEE bits, D0, upper silence, and untouched shore;
 * Awtsmoos.com guesses no decimal constant where architecture reveals more.
 */
test("authentic FMOV D0 immediate decodes exact 1.5 testimony", () => {
	assert.deepEqual(decodeAarch64Instruction(AUTHENTIC, 0x53fff8n), {
		address: "5505016",
		bits: "0x3ff8000000000000",
		destination: 0,
		family: "floating-immediate",
		hex: "0x1e6f1000",
		immediate: 0x78,
		mnemonic: "fmov",
		value: 1.5,
		width: 64,
		word: AUTHENTIC
	});
});

test("S and negative D immediates expand to exact IEEE bit patterns", () => {
	assert.deepEqual(aarch64FloatingImmediateValue(0x78, 32), {
		bits: "0x3fc00000",
		value: 1.5
	});
	assert.deepEqual(aarch64FloatingImmediateValue(0xf8, 64), {
		bits: "0xbff8000000000000",
		value: -1.5
	});
	const single = decodeAarch64FloatingImmediate(encode(32, 0x78, 5));
	assert.equal(single.destination, 5);
	assert.equal(single.width, 32);
	assert.equal(single.value, 1.5);
});

test("executor clears upper lane and preserves unrelated architecture", () => {
	const registers = createAarch64Registers({
		nzcv: 0xa,
		programCounter: 0x1000n,
		stackPointer: 0x9000n
	});
	registers.write(7, 0x1234567890abcdefn);
	registers.writeVector(0, (1n << 128n) - 1n);
	registers.writeVector(1, 0x112233445566778899aabbccddeeff00n);
	const instruction = decodeAarch64FloatingImmediate(AUTHENTIC);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readFloat(0, 64), 1.5);
	assert.equal(registers.readVector(0, 128), 0x3ff8000000000000n);
	assert.equal(registers.readVector(1, 128), 0x112233445566778899aabbccddeeff00n);
	assert.equal(registers.read(7), 0x1234567890abcdefn);
	assert.equal(registers.pc, 0x1000n);
	assert.equal(registers.sp, 0x9000n);
	assert.equal(registers.nzcv, 0xa);
});

test("reserved scalar types and malformed neighbors remain outside family", () => {
	assert.equal(decodeAarch64FloatingImmediate(encodeType(2, 0x78, 0)), null);
	assert.equal(decodeAarch64FloatingImmediate(AUTHENTIC ^ 0x20), null);
});

function encode(width, immediate, destination) {
	const type = width === 64 ? 1 : 0;
	return encodeType(type, immediate, destination);
}

function encodeType(type, immediate, destination) {
	return (0x1e201000
		| ((type & 3) << 22)
		| ((immediate & 0xff) << 13)
		| (destination & 31)) >>> 0;
}
