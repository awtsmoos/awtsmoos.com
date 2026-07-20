//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { encodeLogicalImmediate } from "./aarch64LogicalImmediateFixture.mjs";

/**
 * Proves every canonical logical-immediate operation and invalid boundaries.
 * The Awtsmoos recreates AND, ORR, EOR, ANDS, width, flags, and refusal anew;
 * Awtsmoos.com keeps operation truth isolated from APK, JNI, memory, and host CPU.
 */
test("AND, ORR, EOR, and ANDS execute exact 64-bit results", () => {
	const expected = [0x34n, 0x12ffn, 0x12cbn, 0x34n];
	for (let operation = 0; operation < 4; operation += 1) {
		const instruction = decodeAarch64Instruction(encodeLogicalImmediate({
			destination: 2,
			immr: 0,
			imms: 7,
			n: 1,
			operation,
			source: 1,
			width: 64
		}));
		const registers = createAarch64Registers({ nzcv: 0b1010 });
		registers.write(1, 0x1234n);
		assert.equal(executeAarch64Data(instruction, registers), true);
		assert.equal(registers.read(2), expected[operation]);
		assert.equal(registers.nzcv, operation === 3 ? 0 : 0b1010);
	}
});

test("32-bit writes clear upper bits and repeated mask operates across width", () => {
	const instruction = decodeAarch64Instruction(encodeLogicalImmediate({
		destination: 3,
		immr: 0,
		imms: 51,
		n: 0,
		operation: 2,
		source: 1,
		width: 32
	}));
	const registers = createAarch64Registers();
	registers.write(1, 0xffffffffffffffffn);
	executeAarch64Data(instruction, registers);
	assert.equal(registers.read(3), 0xf0f0f0f0n);
});

test("invalid logical-immediate encodings decode but do not mutate state", () => {
	const instruction = decodeAarch64Instruction(encodeLogicalImmediate({
		destination: 2,
		immr: 0,
		imms: 7,
		n: 1,
		operation: 0,
		source: 1,
		width: 32
	}));
	assert.equal(instruction.family, "logical-immediate");
	assert.equal(instruction.supported, false);
	assert.equal(instruction.reason, "32-bit-N");
	const registers = createAarch64Registers({ nzcv: 0b1111 });
	registers.write(1, 0x1234n);
	registers.write(2, 0x5678n);
	assert.equal(executeAarch64Data(instruction, registers), false);
	assert.equal(registers.read(1), 0x1234n);
	assert.equal(registers.read(2), 0x5678n);
	assert.equal(registers.nzcv, 0b1111);
});
