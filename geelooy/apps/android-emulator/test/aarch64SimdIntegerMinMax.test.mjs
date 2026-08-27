//B"H //Boruch Hashem //Blessed is He
import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
/**
 * Proves integer SIMD min/max through authentic and adversarial lane values.
 * The Awtsmoos renews sign, extrema, alias, and destination in measured light;
 * Awtsmoos.com keeps neighboring families and scalar state architecturally right.
 */
test("authentic SMIN selects signed 2S lanes and clears the upper half", () => {
	const instruction = decodeAarch64Instruction(0x0ea06c20, 0x61734cn);
	assert.deepEqual(shape(instruction), {
		destination: 0, elementWidth: 32, family: "simd-integer-minmax",
		laneCount: 2, minimum: true, mnemonic: "smin", secondSource: 0,
		signed: true, source: 1, width: 64
	});
	const registers = createAarch64Registers({ nzcv: 9,
		programCounter: 0x61734cn, stackPointer: 0x9000n });
	registers.write(8, 0x1234n);
	registers.writeVector(0, 0x0000000000000000ffffffff00000000n, 128);
	registers.writeVector(1, 0x00006ffe00779fc000006ffe0077c170n, 128);
	registers.writeVector(2, 0xfeedn, 128);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.equal(registers.readVector(0, 128), 0xffffffff00000000n);
	assert.deepEqual([
		registers.readVector(1, 128), registers.readVector(2, 128),
		registers.read(8), registers.pc, registers.sp, registers.nzcv
	], [
		0x00006ffe00779fc000006ffe0077c170n, 0xfeedn,
		0x1234n, 0x61734cn, 0x9000n, 9
	]);
});
test("all operations and arrangements select the correct raw lanes", () => {
	const cases = [[64, 8, false, true], [128, 8, true, true],
		[64, 16, false, false], [128, 16, true, false],
		[64, 32, false, true], [128, 32, true, false]];
	for (const [width, elementWidth, unsigned, minimum] of cases) {
		const lanes = width / elementWidth;
		const left = laneValues(elementWidth, lanes, false);
		const right = laneValues(elementWidth, lanes, true);
		const registers = createAarch64Registers();
		registers.writeVector(3, pack(left, elementWidth), width);
		registers.writeVector(4, pack(right, elementWidth), width);
		registers.writeVector(5, (1n << 128n) - 1n, 128);
		const instruction = decodeAarch64Instruction(
			encode(width, elementWidth, unsigned, minimum, 4, 3, 5)
		);
		executeAarch64Data(instruction, registers);
		const expected = chooseLanes(left, right, elementWidth, unsigned, minimum);
		const upper = Array((128 - width) / elementWidth).fill(0n);
		assert.deepEqual(unpack(registers.readVector(5, 128), elementWidth, 128),
			[...expected, ...upper]);
	}
});
test("source and destination aliases remain safe including V31", () => {
	const aliases = [[6, 7, 6], [6, 7, 7], [6, 6, 6], [31, 31, 31]];
	for (const [source, secondSource, destination] of aliases) {
		const registers = createAarch64Registers();
		const left = [0x80n, 0x7fn, 0x01n, 0xffn, 4n, 5n, 6n, 7n];
		const right = source === secondSource ? left
			: [1n, 2n, 3n, 4n, 9n, 8n, 7n, 6n];
		registers.writeVector(source, pack(left, 8), 64);
		registers.writeVector(secondSource, pack(right, 8), 64);
		const instruction = decodeAarch64Instruction(
			encode(64, 8, false, true, secondSource, source, destination)
		);
		executeAarch64Data(instruction, registers);
		assert.deepEqual(unpack(registers.readVector(destination, 64), 8, 64),
			chooseLanes(left, right, 8, false, true));
	}
});
test("reserved sizes and neighboring SIMD words stay outside min/max", () => {
	for (const width of [64, 128]) {
		assert.equal(decodeAarch64Instruction(
			encode(width, 64, false, true, 2, 1, 0)
		).family, "unknown");
	}
	const neighbors = [0x6e218c00, 0x2e303800, 0x6e004001, 0x0e205800, 0x6e000400, 0x00000000];
	for (const word of neighbors) {
		assert.notEqual(decodeAarch64Instruction(word).family, "simd-integer-minmax");
	}
});
function encode(width, elementWidth, unsigned, minimum, rm, rn, rd) {
	const q = width === 128 ? 1 : 0;
	const size = { 8: 0, 16: 1, 32: 2, 64: 3 }[elementWidth];
	return (0x0e206400 | (q << 30) | (Number(unsigned) << 29)
		| (size << 22) | (rm << 16) | (Number(minimum) << 11)
		| (rn << 5) | rd) >>> 0;
}
function laneValues(width, count, alternate) {
	const mask = (1n << BigInt(width)) - 1n;
	const values = alternate ? [mask, 1n, mask >> 1n, 0n]
		: [0n, mask, 2n, mask >> 1n];
	return Array.from({ length: count }, (_, lane) => values[lane % values.length]);
}
function chooseLanes(left, right, width, unsigned, minimum) {
	return left.map((raw, lane) => {
		const other = right[lane];
		const a = unsigned ? raw : BigInt.asIntN(width, raw);
		const b = unsigned ? other : BigInt.asIntN(width, other);
		return (minimum ? a <= b : a >= b) ? raw : other;
	});
}
function pack(lanes, width) {
	return lanes.reduce((value, lane, index) => value
		| (lane << BigInt(index * width)), 0n);
}
function unpack(value, width, totalWidth) {
	const mask = (1n << BigInt(width)) - 1n;
	return Array.from({ length: totalWidth / width }, (_, index) =>
		(value >> BigInt(index * width)) & mask);
}
function shape(instruction) {
	const keys = ["destination", "elementWidth", "family", "laneCount", "minimum",
		"mnemonic", "secondSource", "signed", "source", "width"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
