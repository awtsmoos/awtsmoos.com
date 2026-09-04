//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves the real Flutter FMUL and the complete measured two-source float family.
 * The Awtsmoos renews 2S, 4S, 2D, alias, zero, infinity, and NaN in light;
 * Awtsmoos.com keeps the opcode family generic beyond every tested APK night.
 */
test("runtime FMUL and toolchain arrangements decode", function decodeFamily() {
	for (const [word, mnemonic, lanes, elementWidth] of [
		[0x2e21dc00, "fmul", 2, 32],
		[0x6e25dc83, "fmul", 4, 32],
		[0x6e68dce6, "fmul", 2, 64],
		[0x0e2bd549, "fadd", 2, 32],
		[0x4eb7d6d5, "fsub", 4, 32],
		[0x6e65fc83, "fdiv", 2, 64]
	]) {
		const instruction = decodeAarch64Instruction(word);
		assert.equal(instruction.family, "simd-floating-arithmetic");
		assert.equal(instruction.mnemonic, mnemonic);
		assert.equal(instruction.laneCount, lanes);
		assert.equal(instruction.elementWidth, elementWidth);
	}
});

test("runtime FMUL executes alias-safe two-lane Float32 multiplication", function runtimeFmul() {
	const registers = createAarch64Registers();
	registers.writeVector(0, packFloats([1.5, -2], 32), 64);
	registers.writeVector(1, packFloats([2, 4], 32), 64);
	const instruction = decodeAarch64Instruction(0x2e21dc00);
	assert.equal(executeAarch64Data(instruction, registers), true);
	assert.deepEqual(unpackFloats(registers.readVector(0, 64), 32, 2), [3, -8]);
});

test("vector arithmetic preserves Float32 rounding and IEEE edge values", function ieeeEdges() {
	assert.deepEqual(run(0x4e2ed5ac, [0.1, -0, 1, Number.NaN], [0.2, 3, Number.POSITIVE_INFINITY, 2]), [
		Math.fround(Math.fround(0.1) + Math.fround(0.2)),
		3,
		Number.POSITIVE_INFINITY,
		Number.NaN
	]);
});

test("reserved one-D arrangements stay unknown", function rejectOneD() {
	assert.equal(decodeAarch64Instruction(0x2e61dc00).family, "unknown");
});

function run(word, left, right) {
	const instruction = decodeAarch64Instruction(word);
	const registers = createAarch64Registers();
	registers.writeVector(instruction.source, packFloats(left, instruction.elementWidth), instruction.width);
	registers.writeVector(instruction.secondSource, packFloats(right, instruction.elementWidth), instruction.width);
	executeAarch64Data(instruction, registers);
	return unpackFloats(registers.readVector(instruction.destination, instruction.width), instruction.elementWidth, instruction.laneCount);
}

function packFloats(values, width) {
	const buffer = new ArrayBuffer(16);
	const view = new DataView(buffer);
	values.forEach(function write(value, index) {
		if (width === 32) view.setFloat32(index * 4, value, true);
		else view.setFloat64(index * 8, value, true);
	});
	return view.getBigUint64(0, true) | (view.getBigUint64(8, true) << 64n);
}

function unpackFloats(bits, width, count) {
	const buffer = new ArrayBuffer(16);
	const view = new DataView(buffer);
	view.setBigUint64(0, BigInt.asUintN(64, bits), true);
	view.setBigUint64(8, BigInt(bits) >> 64n, true);
	return Array.from({ length: count }, function read(_, index) {
		return width === 32 ? view.getFloat32(index * 4, true) : view.getFloat64(index * 8, true);
	});
}
