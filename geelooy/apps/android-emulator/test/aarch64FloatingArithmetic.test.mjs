//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves scalar FMUL/FDIV/FADD/FSUB around the authentic Flutter division word.
 * The Awtsmoos recreates IEEE operands, ordered result, and vector destination;
 * Awtsmoos.com uses no host-native instruction and no app-specific shortcut.
 */
test("authentic FDIV S0, S0, S1 returns exact one bits", () => {
	const instruction = decodeAarch64Instruction(0x1e211800, 4778272n);
	assert.deepEqual(shape(instruction), {
		destination: 0, family: "floating-arithmetic-two-source",
		firstSource: 0, mnemonic: "fdiv", secondSource: 1, width: 32
	});
	const registers = createAarch64Registers({ nzcv: 9, stackPointer: 0x8000n });
	registers.write(8, 0x1234n);
	registers.writeVector(0, 0xffff00003f800000n, 128);
	registers.writeFloat(1, 1, 32);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readFloat(0, 32), 1);
	assert.equal(registers.readVector(0, 128), 0x3f800000n);
	assert.equal(registers.read(8), 0x1234n);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.nzcv, 9);
});
test("S and D variants decode for all measured operations", () => {
	for (const width of [32, 64]) {
		for (const mnemonic of ["fmul", "fdiv", "fadd", "fsub"]) {
			const decoded = decodeAarch64Instruction(encode({
				destination: 7, firstSource: 5, mnemonic,
				secondSource: 6, width
			}));
			assert.equal(decoded.mnemonic, mnemonic);
			assert.equal(decoded.width, width);
		}
	}
});
test("ordered arithmetic preserves division and subtraction direction", () => {
	assert.equal(run("fdiv", 9, 3, 64), 3);
	assert.equal(run("fsub", 9, 3, 64), 6);
	assert.equal(run("fmul", 1.5, 2, 32), 3);
	assert.equal(run("fadd", 1.5, 2.25, 32), 3.75);
});
test("IEEE rounding, signed zero, infinity, and NaN reach scalar lanes", () => {
	const rounded = run("fadd", Math.fround(0.1), Math.fround(0.2), 32);
	assert.equal(rounded, Math.fround(Math.fround(0.1) + Math.fround(0.2)));
	assert.ok(Object.is(run("fmul", -0, 2, 64), -0));
	assert.equal(run("fdiv", 1, 0, 64), Number.POSITIVE_INFINITY);
	assert.ok(Number.isNaN(run("fdiv", 0, 0, 64)));
});
test("V31 is writable and unsupported neighbors remain unknown", () => {
	const registers = createAarch64Registers();
	registers.writeFloat(1, 2, 64);
	registers.writeFloat(2, 4, 64);
	const instruction = decodeAarch64Instruction(encode({
		destination: 31, firstSource: 1, mnemonic: "fmul",
		secondSource: 2, width: 64
	}));
	executeAarch64Data(instruction, registers);
	assert.equal(registers.readFloat(31, 64), 8);
	const base = encode({ destination: 0, firstSource: 0,
		mnemonic: "fmul", secondSource: 1, width: 32 });
	for (const word of [base | (4 << 12), 0x1ea00800, 0x00000000]) {
		assert.equal(decodeAarch64Instruction(word >>> 0).family, "unknown");
	}
});
function run(mnemonic, first, second, width) {
	const instruction = decodeAarch64Instruction(encode({
		destination: 3, firstSource: 1, mnemonic,
		secondSource: 2, width
	}));
	const registers = createAarch64Registers();
	registers.writeFloat(1, first, width);
	registers.writeFloat(2, second, width);
	executeAarch64Data(instruction, registers);
	return registers.readFloat(3, width);
}
function encode(options) {
	const operations = { fmul: 0, fdiv: 1, fadd: 2, fsub: 3 };
	let word = 0x1e200800;
	if (options.width === 64) word |= 1 << 22;
	word |= operations[options.mnemonic] << 12;
	word |= (options.secondSource & 31) << 16;
	word |= (options.firstSource & 31) << 5;
	word |= options.destination & 31;
	return word >>> 0;
}
function shape(instruction) {
	const keys = ["destination", "family", "firstSource", "mnemonic",
		"secondSource", "width"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
