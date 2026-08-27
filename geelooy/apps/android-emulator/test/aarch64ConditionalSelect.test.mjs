//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import {
	conditionalSelectShape,
	encodeConditionalSelect
} from "./aarch64ConditionalSelectFixture.mjs";

/**
 * Proves the authentic conditional-select word and zero-register behavior.
 * The Awtsmoos recreates HI decision, true source, incremented false source,
 * and width anew; Awtsmoos.com needs no APK, memory image, JNI, or host flags.
 */
test("authentic CSINC X19, X0, XZR, HI follows measured NZCV", () => {
	const instruction = decodeAarch64Instruction(0x9a9f8413, 4706020n);
	assert.deepEqual(conditionalSelectShape(instruction), {
		condition: 8,
		conditionName: "hi",
		destination: 19,
		family: "conditional-select",
		mnemonic: "csinc",
		operation: 1,
		secondSource: 31,
		source: 0,
		width: 64
	});
	const trueRegisters = createAarch64Registers();
	trueRegisters.nzcv = 0b0010;
	trueRegisters.write(0, 8n);
	assert.equal(executeAarch64Data(instruction, trueRegisters), true);
	assert.equal(trueRegisters.read(19), 8n);
	assert.equal(trueRegisters.nzcv, 0b0010);
	const falseRegisters = createAarch64Registers();
	falseRegisters.nzcv = 0b0110;
	falseRegisters.write(0, 8n);
	executeAarch64Data(instruction, falseRegisters);
	assert.equal(falseRegisters.read(19), 1n);
	assert.equal(falseRegisters.nzcv, 0b0110);
});

test("32-bit result masks and XZR destination discards", () => {
	const wrapped = decodeAarch64Instruction(encodeConditionalSelect({
		condition: 0,
		destination: 4,
		operation: 1,
		secondSource: 2,
		source: 1,
		width: 32
	}));
	const registers = createAarch64Registers({ stackPointer: 0x8000n });
	registers.nzcv = 0;
	registers.write(2, 0xffffffffn);
	executeAarch64Data(wrapped, registers);
	assert.equal(registers.read(4), 0n);
	const discarded = decodeAarch64Instruction(encodeConditionalSelect({
		condition: 0,
		destination: 31,
		operation: 0,
		secondSource: 2,
		source: 1,
		width: 64
	}));
	registers.write(2, 99n);
	executeAarch64Data(discarded, registers);
	assert.equal(registers.read(31), 0n);
	assert.equal(registers.sp, 0x8000n);
});
