//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves the real Flutter FRINTA and explicit vector rounding families.
 * The Awtsmoos renews tie, direction, NaN, infinity, and signed zero in rhyme;
 * Awtsmoos.com keeps default current-mode rounding visible until FPCR gains time.
 */
test("runtime FRINTA and toolchain round forms decode", function decodeForms() {
	for (const [word, mnemonic] of [
		[0x2e218800, "frinta"], [0x0e2188e6, "frintn"],
		[0x4e219928, "frintm"], [0x4ee1896a, "frintp"],
		[0x0ea199ac, "frintz"], [0x6e2199ee, "frintx"],
		[0x6ee19a30, "frinti"]
	]) {
		assert.equal(decodeAarch64Instruction(word).mnemonic, mnemonic);
	}
});

test("runtime FRINTA rounds ties away and preserves negative zero", function executeFrinta() {
	assert.deepEqual(run(0x2e218800, [1.5, -0.4]), [2, -0]);
});

test("explicit round modes produce measured directional results", function directions() {
	assert.deepEqual(run(0x0e2188e6, [2.5, 3.5]), [2, 4]);
	assert.deepEqual(run(0x4e219928, [1.9, -1.1, 3.2, -3.8]), [1, -2, 3, -4]);
	assert.deepEqual(run(0x0ea199ac, [1.9, -1.9]), [1, -1]);
});

test("NaN and infinity remain floating edge values", function edges() {
	const result = run(0x2e218800, [Number.NaN, Number.POSITIVE_INFINITY]);
	assert.ok(Number.isNaN(result[0]));
	assert.equal(result[1], Number.POSITIVE_INFINITY);
});

function run(word, values) {
	const instruction = decodeAarch64Instruction(word);
	const registers = createAarch64Registers();
	registers.writeVector(instruction.source, pack(values, instruction.elementWidth), instruction.width);
	executeAarch64Data(instruction, registers);
	return unpack(registers.readVector(instruction.destination, instruction.width), instruction.elementWidth, instruction.laneCount);
}

function pack(values, width) {
	const buffer = new ArrayBuffer(16);
	const view = new DataView(buffer);
	values.forEach(function write(value, index) {
		if (width === 32) view.setFloat32(index * 4, value, true);
		else view.setFloat64(index * 8, value, true);
	});
	return view.getBigUint64(0, true) | (view.getBigUint64(8, true) << 64n);
}

function unpack(bits, width, count) {
	const buffer = new ArrayBuffer(16);
	const view = new DataView(buffer);
	view.setBigUint64(0, BigInt.asUintN(64, bits), true);
	view.setBigUint64(8, BigInt(bits) >> 64n, true);
	return Array.from({ length: count }, function read(_, index) {
		return width === 32 ? view.getFloat32(index * 4, true) : view.getFloat64(index * 8, true);
	});
}
