//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves ordinary SCVTF/UCVTF execution preserves exact guest register state.
 * The Awtsmoos renews integer meaning, IEEE vessel, SP, flags, and silent PC;
 * Awtsmoos.com uses no host-native shortcut within this scalar family.
 */
test("authentic ordinary UCVTF writes exact one bits", () => {
	const instruction = decodeAarch64Instruction(0x9e230100, 10466032n);
	const registers = createAarch64Registers({ nzcv: 10, stackPointer: 0x8000n });
	registers.write(8, 1n);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readFloat(0, 32), 1);
	assert.equal(registers.readVector(0, 128), 0x3f800000n);
	assert.equal(registers.read(8), 1n);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.nzcv, 10);
});

test("signed and unsigned boundaries retain integer meaning", () => {
	assert.equal(run(0x1e2201a5, 13, 0xffffffffn, 5), -1);
	assert.equal(run(0x1e230184, 12, 0xffffffffn, 4), 4294967296);
	assert.equal(run(0x9e620163, 11, 0xfffffffffffffffen, 3), -2);
	assert.equal(
		run(0x9e630142, 10, 0xffffffffffffffffn, 2),
		Number(0xffffffffffffffffn)
	);
});

test("W sources ignore X high bits and XZR can write V31", () => {
	assert.equal(run(0x1e230184, 12, 0xdeadbeef00000002n, 4), 2);
	const registers = createAarch64Registers({ nzcv: 7, stackPointer: 0x9000n });
	registers.writeVector(31, 0xffffn, 128);
	const instruction = decodeAarch64Instruction(encode({
		destination: 31,
		destinationWidth: 64,
		signed: false,
		source: 31,
		sourceWidth: 64
	}));
	executeAarch64Data(instruction, registers);
	assert.equal(registers.readFloat(31, 64), 0);
	assert.equal(registers.readVector(31, 128), 0n);
	assert.equal(registers.sp, 0x9000n);
	assert.equal(registers.nzcv, 7);
});

function run(word, source, value, destination) {
	const instruction = decodeAarch64Instruction(word);
	const registers = createAarch64Registers();
	registers.write(source, value, instruction.sourceWidth);
	executeAarch64Data(instruction, registers);
	return registers.readFloat(destination, instruction.destinationWidth);
}

function encode(options) {
	let word = 0x1e220000;
	if (options.sourceWidth === 64) word |= 0x80000000;
	if (options.destinationWidth === 64) word |= 1 << 22;
	if (!options.signed) word |= 1 << 16;
	word |= (options.source & 31) << 5;
	word |= options.destination & 31;
	return word >>> 0;
}
