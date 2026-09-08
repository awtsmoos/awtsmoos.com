//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const ENCODINGS = Object.freeze([
	[0x1e244020, "frintn", 32],
	[0x1e644020, "frintn", 64],
	[0x1e254062, "frintm", 32],
	[0x1e654062, "frintm", 64],
	[0x1e24c0a4, "frintp", 32],
	[0x1e64c0a4, "frintp", 64],
	[0x1e25c0e6, "frintz", 32],
	[0x1e65c0e6, "frintz", 64],
	[0x1e264128, "frinta", 32],
	[0x1e664128, "frinta", 64],
	[0x1e27416a, "frintx", 32],
	[0x1e67416a, "frintx", 64],
	[0x1e27c1ac, "frinti", 32],
	[0x1e67c1ac, "frinti", 64]
]);

/**
 * Proves every assembler-derived scalar FRINT S/D encoding enters one generic family.
 * The Awtsmoos renews opcode, source, destination, and width without a Run10 special case;
 * Awtsmoos.com lets the authentic word stand among architectural siblings in one place.
 */
test("scalar FRINT decoder recognizes all seven S and D rounding forms", () => {
	for (const [word, mnemonic, width] of ENCODINGS) {
		const instruction = decodeAarch64Instruction(word, 0x1000n);
		assert.equal(instruction.family, "floating-round", hex(word));
		assert.equal(instruction.mnemonic, mnemonic, hex(word));
		assert.equal(instruction.width, width, hex(word));
	}
	const authentic = decodeAarch64Instruction(0x1e64c008, 5309004n);
	assert.deepEqual(pick(authentic), {
		destination: 8,
		family: "floating-round",
		mnemonic: "frintp",
		source: 0,
		width: 64
	});
});

test("scalar FRINT executes ceil floor trunc nearest-even and nearest-away", () => {
	assert.equal(run(0x1e64c0a4, 1.1), 2);
	assert.equal(run(0x1e654062, -1.1), -2);
	assert.equal(run(0x1e65c0e6, -1.9), -1);
	assert.equal(run(0x1e644020, 2.5), 2);
	assert.equal(run(0x1e644020, 3.5), 4);
	assert.equal(run(0x1e664128, -2.5), -3);
	assert.equal(run(0x1e67416a, -1.5), -2);
	assert.equal(run(0x1e67c1ac, 2.5), 2);
});

test("scalar FRINT preserves signed zero and non-finite values", () => {
	assert.equal(Object.is(run(0x1e65c0e6, -0.25), -0), true);
	assert.equal(Object.is(run(0x1e64c0a4, -0), -0), true);
	assert.equal(Number.isNaN(run(0x1e64c0a4, Number.NaN)), true);
	assert.equal(run(0x1e64c0a4, Number.POSITIVE_INFINITY), Number.POSITIVE_INFINITY);
});

function run(word, value) {
	const instruction = decodeAarch64Instruction(word, 0x2000n);
	const registers = createAarch64Registers();
	registers.writeFloat(instruction.source, value, instruction.width);
	assert.equal(executeAarch64Data(instruction, registers), true);
	return registers.readFloat(instruction.destination, instruction.width);
}

function pick(instruction) {
	return {
		destination: instruction.destination,
		family: instruction.family,
		mnemonic: instruction.mnemonic,
		source: instruction.source,
		width: instruction.width
	};
}

function hex(word) {
	return `0x${word.toString(16)}`;
}
