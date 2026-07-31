//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";

/**
 * Proves fixed SCVTF/UCVTF scale decoding across every legal boundary.
 * The Awtsmoos renews fraction, signed garment, W/X source, and S/D shore;
 * Awtsmoos.com leaves invalid scales and valid neighboring families at their door.
 */
test("authentic UCVTF S0, X8, #1 decodes exactly", () => {
	assert.deepEqual(shape(decodeAarch64Instruction(0x9e03fd00, 9508828n)), {
		destination: 0,
		destinationWidth: 32,
		family: "integer-convert-to-floating",
		fixedPoint: true,
		fractionalBits: 1,
		mnemonic: "ucvtf",
		signed: false,
		source: 8,
		sourceWidth: 64
	});
});

test("all legal width, type, sign, and fractional boundaries decode", () => {
	for (const sourceWidth of [32, 64]) {
		for (const destinationWidth of [32, 64]) {
			for (const signed of [true, false]) {
				for (const fractionalBits of [1, sourceWidth]) {
					const decoded = decodeAarch64Instruction(encode({
						destination: 17,
						destinationWidth,
						fractionalBits,
						signed,
						source: 19,
						sourceWidth
					}));
					assert.equal(decoded.sourceWidth, sourceWidth);
					assert.equal(decoded.destinationWidth, destinationWidth);
					assert.equal(decoded.signed, signed);
					assert.equal(decoded.fractionalBits, fractionalBits);
				}
			}
		}
	}
});

test("invalid W scales and reserved floating types remain unknown", () => {
	const invalidW = encode({
		destinationWidth: 32,
		fractionalBits: 33,
		signed: true,
		sourceWidth: 32
	});
	const reservedType = encode({
		destinationWidth: 32,
		fractionalBits: 1,
		signed: true,
		sourceWidth: 64
	}) | (2 << 22);
	for (const word of [invalidW, reservedType >>> 0]) {
		assert.equal(decodeAarch64Instruction(word).family, "unknown");
	}
});

test("valid neighboring instructions remain in their own decoder families", () => {
	const neighbor = decodeAarch64Instruction(0xd503201f);
	assert.equal(neighbor.family, "system-hint");
	assert.notEqual(neighbor.family, "integer-convert-to-floating");
});

function encode(options) {
	let word = 0x1e020000;
	if ((options.sourceWidth ?? 32) === 64) word |= 0x80000000;
	if ((options.destinationWidth ?? 32) === 64) word |= 1 << 22;
	if (!(options.signed ?? true)) word |= 1 << 16;
	word |= ((64 - (options.fractionalBits ?? 1)) & 63) << 10;
	word |= ((options.source ?? 1) & 31) << 5;
	word |= (options.destination ?? 2) & 31;
	return word >>> 0;
}

function shape(instruction) {
	const keys = ["destination", "destinationWidth", "family", "fixedPoint",
		"fractionalBits", "mnemonic", "signed", "source", "sourceWidth"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
