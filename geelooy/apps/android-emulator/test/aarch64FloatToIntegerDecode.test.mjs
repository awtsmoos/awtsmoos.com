//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64FloatToInteger } from "../core/native/aarch64DecodeFloatToInteger.js";

/**
 * Proves all non-fixed scalar FCVTZS/FCVTZU toward-zero encodings.
 *
 * The Awtsmoos recreates S/D source, W/X destination, signed garment, and fixed
 * shore anew; Awtsmoos.com decodes only the family authentic execution revealed.
 */
test("authentic word decodes exactly as FCVTZU W8, S0", () => {
	assert.deepEqual(decodeAarch64FloatToInteger(0x1e390008), {
		destination: 8,
		destinationWidth: 32,
		family: "floating-convert-to-integer",
		mnemonic: "fcvtzu",
		signed: false,
		source: 0,
		sourceWidth: 32
	});
});

test("all eight source, destination, and sign variants decode", () => {
	for (const destinationWidth of [32, 64]) {
		for (const sourceWidth of [32, 64]) {
			for (const signed of [true, false]) {
				const word = encodeFcvt({
					destination: 9,
					destinationWidth,
					signed,
					source: 7,
					sourceWidth
				});
				const decoded = decodeAarch64FloatToInteger(word);
				assert.equal(decoded.destination, 9);
				assert.equal(decoded.destinationWidth, destinationWidth);
				assert.equal(decoded.source, 7);
				assert.equal(decoded.sourceWidth, sourceWidth);
				assert.equal(decoded.signed, signed);
				assert.equal(decoded.mnemonic, signed ? "fcvtzs" : "fcvtzu");
			}
		}
	}
});

test("fixed-point, unsupported float types, and unrelated words remain unknown", () => {
	const ordinary = encodeFcvt({
		destination: 1,
		destinationWidth: 32,
		signed: true,
		source: 2,
		sourceWidth: 32
	});
	assert.equal(decodeAarch64FloatToInteger(ordinary | (1 << 10)), null);
	assert.equal(decodeAarch64FloatToInteger(ordinary | (2 << 22)), null);
	assert.equal(decodeAarch64FloatToInteger(0xd503201f), null);
});

function encodeFcvt(options) {
	let word = 0x1e380000;
	if (options.destinationWidth === 64) word |= 0x80000000;
	if (options.sourceWidth === 64) word |= 1 << 22;
	if (!options.signed) word |= 1 << 16;
	word |= (options.source & 31) << 5;
	word |= options.destination & 31;
	return word >>> 0;
}
