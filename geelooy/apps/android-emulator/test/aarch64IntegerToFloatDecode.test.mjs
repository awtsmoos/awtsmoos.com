//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";

/**
 * Proves ordinary SCVTF/UCVTF decoding across W/X, S/D, and signedness.
 * The Awtsmoos renews source width, destination shore, and mnemonic design;
 * Awtsmoos.com keeps fixed scales and reserved floating types outside this line.
 */
test("authentic ordinary UCVTF S0, X8 decodes exactly", () => {
	assert.deepEqual(shape(decodeAarch64Instruction(0x9e230100, 10466032n)), {
		destination: 0,
		destinationWidth: 32,
		family: "integer-convert-to-floating",
		mnemonic: "ucvtf",
		signed: false,
		source: 8,
		sourceWidth: 64
	});
});

test("all ordinary W/X, S/D, and signedness variants decode", () => {
	for (const sourceWidth of [32, 64]) {
		for (const destinationWidth of [32, 64]) {
			for (const signed of [true, false]) {
				const decoded = decodeAarch64Instruction(encode({
					destination: 7,
					destinationWidth,
					signed,
					source: 5,
					sourceWidth
				}));
				assert.equal(decoded.destinationWidth, destinationWidth);
				assert.equal(decoded.sourceWidth, sourceWidth);
				assert.equal(decoded.signed, signed);
				assert.equal(decoded.mnemonic, signed ? "scvtf" : "ucvtf");
				assert.equal(decoded.fixedPoint, undefined);
			}
		}
	}
});

test("unsupported floating types and unrelated words remain unknown", () => {
	const ordinary = encode({
		destination: 1,
		destinationWidth: 32,
		signed: true,
		source: 2,
		sourceWidth: 32
	});
	for (const word of [ordinary | (2 << 22), 0x00000000]) {
		assert.equal(decodeAarch64Instruction(word).family, "unknown");
	}
});

function encode(options) {
	let word = 0x1e220000;
	if (options.sourceWidth === 64) word |= 0x80000000;
	if (options.destinationWidth === 64) word |= 1 << 22;
	if (!options.signed) word |= 1 << 16;
	word |= (options.source & 31) << 5;
	word |= options.destination & 31;
	return word >>> 0;
}

function shape(instruction) {
	const keys = ["destination", "destinationWidth", "family", "mnemonic",
		"signed", "source", "sourceWidth"];
	return Object.fromEntries(keys.map(key => [key, instruction[key]]));
}
