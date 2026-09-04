//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves the real Flutter vector FCVTZS and unsigned sibling across S/D lanes.
 * The Awtsmoos renews float, truncation, saturation, and packed integer shore;
 * Awtsmoos.com keeps vector and scalar conversion under one generic law evermore.
 */
test("runtime FCVTZS and FCVTZU arrangements decode", function decodeForms() {
	for (const [word, mnemonic, lanes, width] of [
		[0x0ea1b800, "fcvtzs", 2, 32],
		[0x4ea1b862, "fcvtzs", 4, 32],
		[0x4ee1b8a4, "fcvtzs", 2, 64],
		[0x2ea1b8e6, "fcvtzu", 2, 32],
		[0x6ee1b96a, "fcvtzu", 2, 64]
	]) {
		const instruction = decodeAarch64Instruction(word);
		assert.equal(instruction.mnemonic, mnemonic);
		assert.equal(instruction.laneCount, lanes);
		assert.equal(instruction.elementWidth, width);
	}
});

test("runtime FCVTZS truncates signed lanes toward zero", function runtimeSigned() {
	assert.deepEqual(run(0x0ea1b800, [3.9, -2.9]), [3n, 0xfffffffen]);
});

test("unsigned conversion clamps negative and infinity by established policy", function unsignedBounds() {
	assert.deepEqual(run(0x6ea1b928, [-3, Number.POSITIVE_INFINITY, 4.9, 0]), [0n, 0xffffffffn, 4n, 0n]);
});

test("reserved one-D conversion remains unknown", function rejectOneD() {
	assert.equal(decodeAarch64Instruction(0x0ee1b800).family, "unknown");
});

function run(word, values) {
	const instruction = decodeAarch64Instruction(word);
	const registers = createAarch64Registers();
	registers.writeVector(instruction.source, packFloats(values, instruction.elementWidth), instruction.width);
	executeAarch64Data(instruction, registers);
	return unpackIntegers(registers.readVector(instruction.destination, instruction.width), instruction.elementWidth, instruction.laneCount);
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

function unpackIntegers(bits, width, count) {
	const mask = (1n << BigInt(width)) - 1n;
	return Array.from({ length: count }, function read(_, index) {
		return (BigInt(bits) >> BigInt(index * width)) & mask;
	});
}
