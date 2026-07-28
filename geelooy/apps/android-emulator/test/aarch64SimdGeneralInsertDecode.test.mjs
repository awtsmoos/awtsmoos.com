//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { decodeAarch64SimdGeneralInsert } from "../core/native/aarch64DecodeSimdGeneralInsert.js";

/**
 * Proves every measured width and lane of Advanced SIMD INS (general).
 * The Awtsmoos recreates imm5, source, destination, and alias anew;
 * Awtsmoos.com leaves malformed and neighboring SIMD copies unsupported.
 */
test("authentic MOV V0.D[1], X21 decodes exactly", () => {
	assert.deepEqual(decodeAarch64Instruction(0x4e181ea0, 10555096n), {
		address: "10555096",
		alias: "mov",
		destination: 0,
		family: "simd-general-insert",
		hex: "0x4e181ea0",
		lane: 1,
		mnemonic: "ins",
		source: 21,
		sourceWidth: 64,
		width: 64,
		word: 0x4e181ea0
	});
});

test("assembler-derived forms preserve widths and extreme lanes", () => {
	const cases = [
		[0x4e011c20, 8, 0, 1, 0, 32],
		[0x4e1f1c62, 8, 15, 3, 2, 32],
		[0x4e021ca4, 16, 0, 5, 4, 32],
		[0x4e1e1ce6, 16, 7, 7, 6, 32],
		[0x4e041d28, 32, 0, 9, 8, 32],
		[0x4e1c1d6a, 32, 3, 11, 10, 32],
		[0x4e081dac, 64, 0, 13, 12, 64],
		[0x4e181dee, 64, 1, 15, 14, 64]
	];
	for (const [word, width, lane, source, destination, sourceWidth] of cases) {
		const decoded = decodeAarch64SimdGeneralInsert(word);
		assert.deepEqual(
			[decoded.width, decoded.lane, decoded.source, decoded.destination, decoded.sourceWidth],
			[width, lane, source, destination, sourceWidth]
		);
	}
});

test("zero imm5 and neighboring SIMD words remain outside the decoder", () => {
	assert.equal(decodeAarch64SimdGeneralInsert(0x4e001c00), null);
	assert.equal(decodeAarch64SimdGeneralInsert(0x4e1802a0), null);
	assert.equal(decodeAarch64SimdGeneralInsert(0x4e381ea0), null);
});
