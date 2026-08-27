//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { decodeAarch64OneSourceBit } from "../core/native/aarch64DecodeOneSourceBit.js";

/**
 * Proves every valid RBIT, REV*, CLZ, and CLS encoding and reserved neighbor.
 * The Awtsmoos recreates exact opcode, width, source, and destination testimony;
 * Awtsmoos.com leaves unmeasured one-source encodings explicitly unknown.
 */
test("authentic RBIT W9, W1 decodes exactly", () => {
	assert.deepEqual(decodeAarch64Instruction(0x5ac00029, 8420904n), {
		address: "8420904",
		destination: 9,
		family: "one-source-bit",
		hex: "0x5ac00029",
		mnemonic: "rbit",
		source: 1,
		width: 32,
		word: 0x5ac00029
	});
});

test("all assembled one-source bit forms decode exactly", () => {
	const cases = [
		[0x5ac00029, "rbit", 32, 1, 9],
		[0xdac0004a, "rbit", 64, 2, 10],
		[0x5ac0046b, "rev16", 32, 3, 11],
		[0xdac0048c, "rev16", 64, 4, 12],
		[0x5ac008ad, "rev", 32, 5, 13],
		[0xdac008ce, "rev32", 64, 6, 14],
		[0xdac00cef, "rev", 64, 7, 15],
		[0x5ac01110, "clz", 32, 8, 16],
		[0xdac01131, "clz", 64, 9, 17],
		[0x5ac01552, "cls", 32, 10, 18],
		[0xdac01573, "cls", 64, 11, 19]
	];
	for (const [word, mnemonic, width, source, destination] of cases) {
		assert.deepEqual(decodeAarch64OneSourceBit(word), {
			destination,
			family: "one-source-bit",
			mnemonic,
			source,
			width
		});
	}
});

test("reserved one-source neighbors remain unknown", () => {
	for (const word of [
		0x5ac00c00,
		0x5ac01800,
		0xdac01800,
		0x1ac00000,
		0xd503201f
	]) {
		assert.equal(decodeAarch64OneSourceBit(word), null);
	}
});
