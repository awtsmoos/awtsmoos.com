//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const AUTHENTIC_INPUT = 0x00006ffe0077c17000006ffe00779fc0n;
const AUTHENTIC_OUTPUT = 0x00006ffe00779fc000006ffe0077c170n;
/**
 * Proves Advanced SIMD EXT from authentic Flutter bytes through generic forms.
 * The Awtsmoos renews source order, alias, and byte window in exact light;
 * Awtsmoos.com keeps scalar state and neighboring reductions architecturally right.
 */
test("authentic EXT rotates V0 by eight bytes into V1", () => {
	const instruction = decodeAarch64Instruction(0x6e004001, 0x617184n);
	assert.deepEqual(shape(instruction), {
		byteOffset: 8, destination: 1, family: "simd-extract",
		mnemonic: "ext", secondSource: 0, source: 0, width: 128
	});
	const registers = createAarch64Registers({
		nzcv: 2,
		programCounter: 0x617184n,
		stackPointer: 0x7000n
	});
	registers.write(8, 0x1234n);
	registers.writeVector(0, AUTHENTIC_INPUT, 128);
	registers.writeVector(2, 0xfeedn, 128);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readVector(1, 128), AUTHENTIC_OUTPUT);
	assert.deepEqual(
		[registers.readVector(0, 128), registers.readVector(2, 128)],
		[AUTHENTIC_INPUT, 0xfeedn]
	);
	assert.deepEqual(
		[registers.read(8), registers.pc, registers.sp, registers.nzcv],
		[0x1234n, 0x617184n, 0x7000n, 2]
	);
});
test("both arrangements preserve source order at extreme offsets", () => {
	const cases = [[128, 0], [128, 1], [128, 8], [128, 15],
		[64, 0], [64, 4], [64, 7]];
	for (const [width, offset] of cases) {
		const first = sequence(width / 8, 0x10);
		const second = sequence(width / 8, 0x80);
		const registers = createAarch64Registers();
		registers.writeVector(3, bytesToBits(first), width);
		registers.writeVector(4, bytesToBits(second), width);
		registers.writeVector(5, (1n << 128n) - 1n, 128);
		const instruction = decodeAarch64Instruction(
			encode(width, offset, 4, 3, 5)
		);
		executeAarch64Data(instruction, registers);
		const expected = [...extractBytes(first, second, offset),
			...Array(16 - (width / 8)).fill(0)];
		assert.deepEqual(
			bitsToBytes(registers.readVector(5, 128), 16),
			expected
		);
	}
});
test("all source and destination aliases remain safe including V31", () => {
	const aliases = [[6, 7, 6], [6, 7, 7], [6, 6, 6], [31, 31, 31]];
	for (const [source, secondSource, destination] of aliases) {
		const registers = createAarch64Registers();
		const first = sequence(16, 1);
		const second = source === secondSource ? first : sequence(16, 101);
		registers.writeVector(source, bytesToBits(first), 128);
		registers.writeVector(secondSource, bytesToBits(second), 128);
		const instruction = decodeAarch64Instruction(
			encode(128, 5, secondSource, source, destination)
		);
		executeAarch64Data(instruction, registers);
		assert.deepEqual(
			bitsToBytes(registers.readVector(destination, 128), 16),
			extractBytes(first, second, 5)
		);
	}
});
test("reserved D offsets and neighboring SIMD encodings stay outside EXT", () => {
	for (let offset = 8; offset < 16; offset += 1) {
		assert.equal(
			decodeAarch64Instruction(encode(64, offset, 2, 1, 0)).family,
			"unknown"
		);
	}
	const neighbors = [0x2e303800, 0x6e000400, 0x0e205800,
		0x6e004401, 0x00000000];
	for (const word of neighbors) {
		assert.notEqual(decodeAarch64Instruction(word).family, "simd-extract");
	}
});
function encode(width, offset, secondSource, source, destination) {
	const q = width === 128 ? 1 : 0;
	return (0x2e000000 | (q << 30) | (secondSource << 16)
		| (offset << 11) | (source << 5) | destination) >>> 0;
}
function extractBytes(first, second, offset) {
	return [...first.slice(offset), ...second.slice(0, offset)];
}
function sequence(length, start) {
	return Array.from({ length }, (_, index) => (start + index) & 0xff);
}
function bytesToBits(bytes) {
	return bytes.reduce((value, byte, index) => {
		return value | (BigInt(byte) << BigInt(index * 8));
	}, 0n);
}
function bitsToBytes(value, length) {
	return Array.from({ length }, (_, index) => {
		return Number((value >> BigInt(index * 8)) & 0xffn);
	});
}
function shape(instruction) {
	const keys = ["byteOffset", "destination", "family", "mnemonic",
		"secondSource", "source", "width"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
