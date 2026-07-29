//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves SCVTF/UCVTF around the authentic Flutter scalar conversion word.
 * The Awtsmoos recreates signed integer, IEEE shore, and vector destination;
 * Awtsmoos.com uses no host-native instruction and no app-specific shortcut.
 */
test("authentic UCVTF S0, X8 decodes and writes exact one bits", () => {
	const instruction = decodeAarch64Instruction(0x9e230100, 10466032n);
	assert.deepEqual(shape(instruction), {
		destination: 0,
		destinationWidth: 32,
		family: "integer-convert-to-floating",
		mnemonic: "ucvtf",
		signed: false,
		source: 8,
		sourceWidth: 64
	});
	const registers = createAarch64Registers({ nzcv: 0b1010, stackPointer: 0x8000n });
	registers.write(8, 1n, 64);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readFloat(0, 32), 1);
	assert.equal(registers.readVector(0, 128), 0x3f800000n);
	assert.equal(registers.read(8), 1n);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.nzcv, 0b1010);
});

test("all W/X, S/D, and signedness variants decode", () => {
	for (const sourceWidth of [32, 64]) {
		for (const destinationWidth of [32, 64]) {
			for (const signed of [true, false]) {
				const decoded = decodeAarch64Instruction(encode({
					destination: 7,
					destinationWidth,
					signed,
					source: 5,
					sourceWidth
				}));
				assert.equal(decoded.destinationWidth, destinationWidth);
				assert.equal(decoded.sourceWidth, sourceWidth);
				assert.equal(decoded.signed, signed);
				assert.equal(decoded.mnemonic, signed ? "scvtf" : "ucvtf");
			}
		}
	}
});

test("signed and unsigned boundaries retain their integer meaning", () => {
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

test("fixed-point, unsupported types, and unrelated words remain unknown", () => {
	const ordinary = encode({ destination: 1, destinationWidth: 32,
		signed: true, source: 2, sourceWidth: 32 });
	for (const word of [
		ordinary | (1 << 10),
		ordinary | (2 << 22),
		0x00000000
	]) {
		assert.equal(decodeAarch64Instruction(word).family, "unknown");
	}
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

function shape(instruction) {
	const keys = ["destination", "destinationWidth", "family", "mnemonic",
		"signed", "source", "sourceWidth"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
