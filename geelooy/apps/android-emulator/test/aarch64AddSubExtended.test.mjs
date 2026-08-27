//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { aarch64ExtendRegisterValue } from "../core/native/aarch64ExtendRegisterValue.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const FORMS = Object.freeze([
	[0x8b220020, 0, "uxtb", 0],
	[0x8b223020, 1, "uxth", 4],
	[0x8b224020, 2, "uxtw", 0],
	[0x8b227020, 3, "uxtx", 4],
	[0x8b228020, 4, "sxtb", 0],
	[0x8b22b020, 5, "sxth", 4],
	[0x8b22c020, 6, "sxtw", 0],
	[0x8b22f020, 7, "sxtx", 4]
]);

test("authentic CMP X0, W20, SXTW decodes and sets equality flags", () => {
	const instruction = decodeAarch64Instruction(0xeb34c01f, 4894156n);
	assert.deepEqual(shape(instruction), {
		destination: 31,
		extensionName: "sxtw",
		extensionOption: 6,
		family: "add-sub-extended-register",
		mnemonic: "cmp",
		secondSource: 20,
		setFlags: true,
		shiftAmount: 0,
		source: 0,
		subtract: true,
		width: 64
	});
	const registers = createAarch64Registers({ nzcv: 1, stackPointer: 0x9000n });
	registers.write(0, 2147n);
	registers.write(20, 2147n, 32);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.nzcv, 6);
	assert.equal(registers.read(0), 2147n);
	assert.equal(registers.sp, 0x9000n);
});

test("all assembler-proven 64-bit extension options decode", () => {
	for (const [word, option, name, shift] of FORMS) {
		const instruction = decodeAarch64Instruction(word);
		assert.equal(instruction.family, "add-sub-extended-register");
		assert.equal(instruction.extensionOption, option);
		assert.equal(instruction.extensionName, name);
		assert.equal(instruction.shiftAmount, shift);
	}
});

test("shared extension helper preserves unsigned and signed widths", () => {
	const registers = createAarch64Registers();
	registers.write(2, 0xffffffffffff80ffn);
	assert.equal(aarch64ExtendRegisterValue(registers, 2, 0), 255n);
	assert.equal(aarch64ExtendRegisterValue(registers, 2, 1), 33023n);
	assert.equal(aarch64ExtendRegisterValue(registers, 2, 4), -1n);
	assert.equal(aarch64ExtendRegisterValue(registers, 2, 5), -32513n);
	assert.equal(aarch64ExtendRegisterValue(registers, 31, 7), 0n);
});

test("extended ADD honors SP source, SP destination, shift, and signed word", () => {
	const registers = createAarch64Registers({ stackPointer: 100n });
	registers.write(2, 0xfffffffcn, 32);
	executeAarch64Data(decodeAarch64Instruction(0x8b22c3e0), registers);
	assert.equal(registers.read(0), 96n);
	registers.write(1, 100n);
	registers.write(2, 3n, 32);
	executeAarch64Data(decodeAarch64Instruction(0x8b22483f), registers);
	assert.equal(registers.sp, 112n);
});

test("32-bit reserved X extensions and shifts above four remain unknown", () => {
	for (const word of [
		encode({ option: 3, width: 32 }),
		encode({ option: 7, width: 32 }),
		encode({ option: 2, shift: 5, width: 64 })
	]) {
		assert.notEqual(
			decodeAarch64Instruction(word).family,
			"add-sub-extended-register"
		);
	}
	assert.equal(
		decodeAarch64Instruction(0xeb13011f).family,
		"add-sub-shifted-register"
	);
});

function encode(options) {
	const sf = options.width === 64 ? 1 : 0;
	return ((sf << 31) | 0x0b200000 | ((options.option || 0) << 13)
		| ((options.shift || 0) << 10) | (2 << 16) | (1 << 5)) >>> 0;
}

function shape(instruction) {
	const keys = ["destination", "extensionName", "extensionOption", "family",
		"mnemonic", "secondSource", "setFlags", "shiftAmount", "source",
		"subtract", "width"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
