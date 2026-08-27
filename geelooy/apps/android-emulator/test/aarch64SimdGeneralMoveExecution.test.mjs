//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Data } from "../core/native/aarch64DecodeData.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves unsigned AdvSIMD lane extraction preserves exact bits and guest state.
 * The Awtsmoos recreates lane payload, zero extension, and destination each instant;
 * Awtsmoos.com leaves vectors, flags, and unrelated general registers untouched.
 */
test("authentic V0.D[1] moves the high pointer lane into X20", () => {
	const registers = createAarch64Registers({ nzcv: 0b1010 });
	registers.writeVector(0, 0x00006ffe000006f000006ffe00000708n, 128);
	registers.write(19, 0x123456789abcdef0n);
	const before = registers.readVector(0, 128);
	execute(registers, 0x4e183c14);
	assert.equal(registers.read(20), 0x00006ffe000006f0n);
	assert.equal(registers.read(19), 0x123456789abcdef0n);
	assert.equal(registers.readVector(0, 128), before);
	assert.equal(registers.nzcv, 0b1010);
});

test("B, H, and S high lanes zero-extend into W destinations", () => {
	const cases = [
		[0x0e1f3c83, 4, 0xaan << 120n, 3, 0xaan],
		[0x0e1e3d07, 8, 0xbeefn << 112n, 7, 0xbeefn],
		[0x0e1c3d8b, 12, 0xdeadbeefn << 96n, 11, 0xdeadbeefn]
	];
	for (const [word, source, vector, destination, expected] of cases) {
		const registers = createAarch64Registers();
		registers.write(destination, 0xffffffffffffffffn);
		registers.writeVector(source, vector, 128);
		execute(registers, word);
		assert.equal(registers.read(destination), expected);
	}
});

test("low D lane moves into X without changing the source vector", () => {
	const registers = createAarch64Registers();
	const vector = 0xaaaabbbbccccdddd0123456789abcdefn;
	registers.writeVector(14, vector, 128);
	execute(registers, 0x4e083dcd);
	assert.equal(registers.read(13), 0x0123456789abcdefn);
	assert.equal(registers.readVector(14, 128), vector);
});

test("V31 is a normal source and X31 discards the extracted result", () => {
	const registers = createAarch64Registers();
	const vector = 0x112233445566778899aabbccddeeff00n;
	registers.writeVector(31, vector, 128);
	execute(registers, encodeMove(1, 0x18, 31, 1));
	assert.equal(registers.read(1), 0x1122334455667788n);
	execute(registers, encodeMove(1, 0x18, 31, 31));
	assert.equal(registers.read(31), 0n);
	assert.equal(registers.readVector(31, 128), vector);
});

function execute(registers, word) {
	const instruction = decodeAarch64Data(word);
	assert.equal(executeAarch64Data(instruction, registers), true);
}

function encodeMove(q, immediate, source, destination) {
	return (0x0e003c00
		| (q << 30)
		| (immediate << 16)
		| (source << 5)
		| destination) >>> 0;
}
