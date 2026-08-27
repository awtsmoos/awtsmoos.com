//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Data } from "../core/native/aarch64DecodeData.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves scalar FCVTZS/FCVTZU execution across architectural register classes.
 *
 * The Awtsmoos recreates source lane, saturated result, W/X destination, and
 * unchanged flags anew. Awtsmoos.com executes the authentic word without a
 * refresh-rate shortcut or host-native floating instruction.
 */
test("authentic FCVTZU W8, S0 converts 60 and preserves source state", () => {
	const registers = createAarch64Registers({ nzcv: 0b1010 });
	registers.writeFloat(0, 60, 32);
	const sourceBits = registers.readVector(0, 128);
	const instruction = decodeAarch64Data(0x1e390008);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.read(8, 32, "zero"), 60n);
	assert.equal(registers.read(8, 64, "zero"), 60n);
	assert.equal(registers.readVector(0, 128), sourceBits);
	assert.equal(registers.nzcv, 0b1010);
});

test("signed W conversion truncates negative values and zero-extends X", () => {
	const registers = createAarch64Registers();
	registers.writeFloat(3, -1.75, 64);
	const instruction = decodeAarch64Data(encodeFcvt({
		destination: 4,
		destinationWidth: 32,
		signed: true,
		source: 3,
		sourceWidth: 64
	}));
	executeAarch64Data(instruction, registers);
	assert.equal(registers.read(4, 32, "zero"), 0xffffffffn);
	assert.equal(registers.read(4, 64, "zero"), 0xffffffffn);
});

test("unsigned conversion clamps negative values to zero", () => {
	const registers = createAarch64Registers();
	registers.writeFloat(2, -900.5, 32);
	const instruction = decodeAarch64Data(encodeFcvt({
		destination: 1,
		destinationWidth: 64,
		signed: false,
		source: 2,
		sourceWidth: 32
	}));
	executeAarch64Data(instruction, registers);
	assert.equal(registers.read(1, 64, "zero"), 0n);
});

test("double overflow saturates an unsigned X destination", () => {
	const registers = createAarch64Registers();
	registers.writeFloat(5, Infinity, 64);
	const instruction = decodeAarch64Data(encodeFcvt({
		destination: 6,
		destinationWidth: 64,
		signed: false,
		source: 5,
		sourceWidth: 64
	}));
	executeAarch64Data(instruction, registers);
	assert.equal(registers.read(6, 64, "zero"), 0xffffffffffffffffn);
});

function encodeFcvt(options) {
	let word = 0x1e380000;
	if (options.destinationWidth === 64) word |= 0x80000000;
	if (options.sourceWidth === 64) word |= 1 << 22;
	if (!options.signed) word |= 1 << 16;
	word |= (options.source & 31) << 5;
	word |= options.destination & 31;
	return word >>> 0;
}
