//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const FORMS = Object.freeze([
	[0x0f008642, "movi", "4h", 0, "18"],
	[0x2f00a647, "mvni", "4h", 8, "60927"],
	[0x4f006651, "movi", "4s", 24, "301989888"],
	[0x0f00c65a, "movi", "2s", 8, "4863"],
	[0x2f00d65f, "mvni", "2s", 16, "4293722112"],
	[0x0f001648, "orr", "2s", 0, "18"],
	[0x6f007657, "bic", "4s", 24, "301989888"]
]);

test("assembler-proven MOVI, MVNI, ORR, and BIC forms decode", () => {
	for (const [word, mnemonic, arrangement, shift, lane] of FORMS) {
		const decoded = decodeAarch64Instruction(word);
		assert.equal(decoded.family, "simd-modified-immediate");
		assert.equal(decoded.mnemonic, mnemonic);
		assert.equal(decoded.arrangement, arrangement);
		assert.equal(decoded.shift, shift);
		assert.equal(decoded.lane, lane);
	}
});

test("MVNI, MSL, ORR, and BIC execute exact replicated lanes", () => {
	assert.equal(run(0x2f00a647, 7, 0n), repeat(0xedffn, 16, 64));
	assert.equal(run(0x0f00c65a, 26, 0n), repeat(0x12ffn, 32, 64));
	assert.equal(run(0x2f00d65f, 31, 0n), repeat(0xffed0000n, 32, 64));
	assert.equal(run(0x0f001648, 8, repeat(1n, 32, 64)), repeat(0x13n, 32, 64));
	assert.equal(run(0x2f001650, 16, (1n << 64n) - 1n), repeat(0xffffffedn, 32, 64));
});

test("Q zero clears upper half while Q one writes all lanes", () => {
	const registers = createAarch64Registers();
	registers.writeVector(10, (1n << 128n) - 1n, 128);
	executeAarch64Data(decodeAarch64Instruction(0x0f00064a), registers);
	assert.equal(registers.readVector(10, 128), repeat(0x12n, 32, 64));
	registers.writeVector(14, 0n, 128);
	executeAarch64Data(decodeAarch64Instruction(0x4f00064e), registers);
	assert.equal(registers.readVector(14, 128), repeat(0x12n, 32, 128));
});

test("V31 combines as a real vector destination", () => {
	const word = encode(1, 0, 1, 0x80, 31);
	const initial = repeat(1n, 32, 128);
	assert.equal(run(word, 31, initial), repeat(0x81n, 32, 128));
});

test("floating, malformed, and reserved neighbors remain unknown", () => {
	for (const word of [0x0f00f400, 0x4f00f400, 0x8f00e400, 0x0f00e000]) {
		assert.equal(decodeAarch64Instruction(word).family, "unknown");
	}
});

function run(word, destination, initial) {
	const registers = createAarch64Registers({ nzcv: 9, stackPointer: 0x9000n });
	registers.write(3, 0x1234n);
	registers.writeVector(destination, initial, 128);
	assert.equal(executeAarch64Data(decodeAarch64Instruction(word), registers), true);
	assert.equal(registers.read(3), 0x1234n);
	assert.equal(registers.sp, 0x9000n);
	assert.equal(registers.nzcv, 9);
	return registers.readVector(destination, 128);
}

function repeat(lane, elementWidth, width) {
	let result = 0n;
	for (let offset = 0; offset < width; offset += elementWidth) {
		result |= lane << BigInt(offset);
	}
	return result;
}

function encode(qBit, op, cmode, immediate, destination) {
	return (0x0f000400 | (qBit << 30) | (op << 29) | (cmode << 12)
		| (((immediate >>> 5) & 7) << 16) | ((immediate & 31) << 5)
		| destination) >>> 0;
}
