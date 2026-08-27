//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const FORMS = Object.freeze([
	[0x6e010420, 8, 0, 0, 1, 0],
	[0x6e1f7462, 8, 15, 14, 3, 2],
	[0x6e0204a4, 16, 0, 0, 5, 4],
	[0x6e1e64e6, 16, 7, 6, 7, 6],
	[0x6e040528, 32, 0, 0, 9, 8],
	[0x6e1c456a, 32, 3, 2, 11, 10],
	[0x6e0805ac, 64, 0, 0, 13, 12],
	[0x6e1805ee, 64, 1, 0, 15, 14]
]);

test("authentic MOV V0.D[1], V0.D[0] is alias-safe", () => {
	const instruction = decodeAarch64Instruction(0x6e180400, 4779208n);
	assert.deepEqual(shape(instruction), {
		alias: "mov", destination: 0, destinationLane: 1,
		elementWidth: 64, family: "simd-element-insert",
		mnemonic: "ins", source: 0, sourceLane: 0
	});
	const registers = createAarch64Registers({ nzcv: 9, stackPointer: 0x8000n });
	registers.write(8, 0x1234n);
	registers.writeVector(0, 0x1122334455667788aabbccddeeff0011n, 128);
	executeAarch64Data(instruction, registers);
	assert.equal(
		registers.readVector(0, 128),
		0xaabbccddeeff0011aabbccddeeff0011n
	);
	assert.equal(registers.read(8), 0x1234n);
	assert.equal(registers.sp, 0x8000n);
	assert.equal(registers.nzcv, 9);
});

test("all assembler-proven B/H/S/D extreme forms decode", () => {
	for (const [word, width, destinationLane, sourceLane, source, destination] of FORMS) {
		const decoded = decodeAarch64Instruction(word);
		assert.equal(decoded.family, "simd-element-insert");
		assert.equal(decoded.elementWidth, width);
		assert.equal(decoded.destinationLane, destinationLane);
		assert.equal(decoded.sourceLane, sourceLane);
		assert.equal(decoded.source, source);
		assert.equal(decoded.destination, destination);
	}
});

test("distinct vectors replace only the appointed byte lane", () => {
	const registers = createAarch64Registers();
	registers.writeVector(2, 0x11111111111111111111111111111111n, 128);
	registers.writeVector(3, 0x00aa0000000000000000000000000000n, 128);
	executeAarch64Data(decodeAarch64Instruction(0x6e1f7462), registers);
	assert.equal(registers.readVector(2, 128), 0xaa111111111111111111111111111111n);
});

test("V31 is a normal source and destination", () => {
	const registers = createAarch64Registers();
	registers.writeVector(31, 0x01020304050607081112131415161718n, 128);
	const word = encode(32, 3, 0, 31, 31);
	executeAarch64Data(decodeAarch64Instruction(word), registers);
	assert.equal(
		(registers.readVector(31, 128) >> 96n) & 0xffffffffn,
		0x15161718n
	);
});

test("malformed lanes and neighboring encodings remain outside the family", () => {
	for (const word of [
		0x6e000400,
		0x6e100400,
		0x6e020c00,
		0x6e1c696a,
		0x4e071d49,
		0x00000000
	]) {
		assert.notEqual(decodeAarch64Instruction(word).family, "simd-element-insert");
	}
});

function encode(width, destinationLane, sourceLane, source, destination) {
	const sizeShift = Math.log2(width / 8);
	const immediateFive = (destinationLane << (sizeShift + 1))
		| (1 << sizeShift);
	const immediateFour = sourceLane << sizeShift;
	return (0x6e000400 | (immediateFive << 16) | (immediateFour << 11)
		| (source << 5) | destination) >>> 0;
}

function shape(instruction) {
	const keys = ["alias", "destination", "destinationLane", "elementWidth",
		"family", "mnemonic", "source", "sourceLane"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
