//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves the real Flutter USHL and signed sibling over measured vector arrangements.
 * The Awtsmoos renews positive left and negative right from each lane's low byte;
 * Awtsmoos.com preserves logical and arithmetic meaning without scalar disguise.
 */
test("runtime USHL and toolchain B H S D forms decode", function decodeForms() {
	for (const [word, mnemonic, width] of [
		[0x2ea34400, "ushl", 32], [0x2e224420, "ushl", 8],
		[0x2e6844e6, "ushl", 16], [0x6ef44672, "ushl", 64],
		[0x0e3746d5, "sshl", 8], [0x0ebd479b, "sshl", 32]
	]) {
		const instruction = decodeAarch64Instruction(word);
		assert.equal(instruction.mnemonic, mnemonic);
		assert.equal(instruction.elementWidth, width);
	}
});

test("runtime USHL shifts corresponding S lanes left and right", function runtimeUshl() {
	const instruction = decodeAarch64Instruction(0x2ea34400);
	const registers = createAarch64Registers();
	registers.writeVector(0, pack([3n, 16n], 32), 64);
	registers.writeVector(3, pack([2n, 0xffn], 32), 64);
	executeAarch64Data(instruction, registers);
	assert.deepEqual(unpack(registers.readVector(0, 64), 32, 2), [12n, 8n]);
});

test("SSHL arithmetic right preserves sign and large shifts saturate lanes", function signedShift() {
	const instruction = decodeAarch64Instruction(0x0ebd479b);
	const registers = createAarch64Registers();
	registers.writeVector(instruction.source, pack([0xfffffff0n, 4n], 32), 64);
	registers.writeVector(instruction.shiftSource, pack([0xffn, 40n], 32), 64);
	executeAarch64Data(instruction, registers);
	assert.deepEqual(unpack(registers.readVector(instruction.destination, 64), 32, 2), [0xfffffff8n, 0n]);
});

test("reserved 1D vector variable shift remains unknown", function rejectOneD() {
	assert.equal(decodeAarch64Instruction(0x2ee24420).family, "unknown");
});

function pack(values, width) {
	let result = 0n;
	values.forEach(function add(value, index) {
		result |= BigInt.asUintN(width, BigInt(value)) << BigInt(index * width);
	});
	return result;
}

function unpack(bits, width, count) {
	const mask = (1n << BigInt(width)) - 1n;
	return Array.from({ length: count }, function read(_, index) {
		return (BigInt(bits) >> BigInt(index * width)) & mask;
	});
}
