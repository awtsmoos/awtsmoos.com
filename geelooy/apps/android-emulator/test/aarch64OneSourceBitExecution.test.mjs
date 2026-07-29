//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Data } from "../core/native/aarch64DecodeData.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves exact one-source bit results, aliases, zero extension, and state safety.
 * The Awtsmoos recreates each bit and byte group while flags and vectors endure;
 * Awtsmoos.com discards X31 results and reads W31/X31 as the zero register.
 */
test("authentic RBIT turns W1 value two into W9 bit thirty", () => {
	const registers = createAarch64Registers({ nzcv: 0b0110 });
	registers.write(1, 2n);
	registers.write(9, 0xffffffffffffffffn);
	registers.writeVector(0, 0x123456789abcdefn, 128);
	execute(registers, 0x5ac00029);
	assert.equal(registers.read(9), 0x40000000n);
	assert.equal(registers.read(1), 2n);
	assert.equal(registers.readVector(0, 128), 0x123456789abcdefn);
	assert.equal(registers.nzcv, 0b0110);
});

test("RBIT and byte reversals honor 32- and 64-bit groups", () => {
	const cases = [
		[0x5ac00020, 1, 0x00000001n, 0x80000000n],
		[0xdac00020, 1, 0x0000000000000001n, 0x8000000000000000n],
		[0x5ac00420, 1, 0x11223344n, 0x22114433n],
		[0xdac00420, 1, 0x1122334455667788n, 0x2211443366558877n],
		[0x5ac00820, 1, 0x11223344n, 0x44332211n],
		[0xdac00820, 1, 0x1122334455667788n, 0x4433221188776655n],
		[0xdac00c20, 1, 0x1122334455667788n, 0x8877665544332211n]
	];
	for (const [word, source, value, expected] of cases) {
		const registers = createAarch64Registers();
		registers.write(source, value);
		execute(registers, word);
		assert.equal(registers.read(0), expected);
	}
});

test("CLZ and CLS cover zero, signs, and boundary transitions", () => {
	const cases = [
		[0x5ac01020, 0n, 32n],
		[0x5ac01020, 0x10n, 27n],
		[0xdac01020, 1n, 63n],
		[0x5ac01420, 0n, 31n],
		[0x5ac01420, 0xffffffffn, 31n],
		[0x5ac01420, 0x3fffffffn, 1n],
		[0xdac01420, 0xffffffffffffffffn, 63n]
	];
	for (const [word, value, expected] of cases) {
		const registers = createAarch64Registers();
		registers.write(1, value);
		execute(registers, word);
		assert.equal(registers.read(0), expected);
	}
});

test("aliasing and register thirty-one obey architectural behavior", () => {
	const registers = createAarch64Registers();
	registers.write(3, 0x11223344n);
	execute(registers, 0x5ac00863);
	assert.equal(registers.read(3), 0x44332211n);
	registers.write(4, 0x123456789abcdef0n);
	execute(registers, 0xdac0009f);
	assert.equal(registers.read(31), 0n);
	execute(registers, 0xdac003e5);
	assert.equal(registers.read(5), 0n);
});

function execute(registers, word) {
	const instruction = decodeAarch64Data(word);
	assert.equal(executeAarch64Data(instruction, registers), true);
}
