//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { encodeConditionalSelect } from "./aarch64ConditionalSelectFixture.mjs";

/**
 * Proves every canonical false transformation and true-source road.
 * The Awtsmoos recreates selection, increment, inversion, negation, and width
 * anew; Awtsmoos.com keeps guest flags unchanged inside an isolated CPU vessel.
 */
test("false road performs CSEL, CSINC, CSINV, and CSNEG", () => {
	const expected = [
		0x12n,
		0x13n,
		0xffffffffffffffedn,
		0xffffffffffffffeen
	];
	for (let operation = 0; operation < 4; operation += 1) {
		const instruction = decodeAarch64Instruction(encodeConditionalSelect({
			condition: 0,
			destination: operation,
			operation,
			secondSource: 2,
			source: 1,
			width: 64
		}));
		const registers = createAarch64Registers();
		registers.nzcv = 0b0010;
		registers.write(1, 0x99n);
		registers.write(2, 0x12n);
		executeAarch64Data(instruction, registers);
		assert.equal(registers.read(operation), expected[operation]);
		assert.equal(registers.nzcv, 0b0010);
	}
});

test("true road always copies Rn for all canonical operations", () => {
	for (let operation = 0; operation < 4; operation += 1) {
		const instruction = decodeAarch64Instruction(encodeConditionalSelect({
			condition: 0,
			destination: 5,
			operation,
			secondSource: 2,
			source: 1,
			width: 64
		}));
		const registers = createAarch64Registers();
		registers.nzcv = 0b0110;
		registers.write(1, 0xabcdefn);
		registers.write(2, 0x12n);
		executeAarch64Data(instruction, registers);
		assert.equal(registers.read(5), 0xabcdefn);
		assert.equal(registers.nzcv, 0b0110);
	}
});
