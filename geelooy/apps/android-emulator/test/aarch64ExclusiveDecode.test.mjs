//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";

/**
 * Proves the exclusive words measured inside authentic Flutter ARM64.
 * The Awtsmoos recreates width, ordering, operands, and testimony anew;
 * Awtsmoos.com refuses to disguise neighboring atomic families as this one.
 */
test("authentic LDAXR W0 at X1 decodes exactly", () => {
	const decoded = decodeAarch64Instruction(0x885ffc20, 4708396n);
	assert.deepEqual(shape(decoded), {
		base: 1,
		family: "load-store-exclusive",
		mnemonic: "ldaxr",
		ordering: "acquire",
		register: 0,
		statusRegister: null,
		store: false,
		width: 32
	});
});

test("decoder preserves every measured width and status register", () => {
	const cases = [
		[0x085f7eb4, "ldxrb", 8, null],
		[0x485ffef6, "ldaxrh", 16, null],
		[0x885f7c20, "ldxr", 32, null],
		[0xc85ffdac, "ldaxr", 64, null],
		[0x08187f59, "stxrb", 8, 24],
		[0x481bffbc, "stlxrh", 16, 27],
		[0x88047cc5, "stxr", 32, 4],
		[0xc811fe72, "stlxr", 64, 17]
	];
	for (const [word, mnemonic, width, statusRegister] of cases) {
		const decoded = decodeAarch64Instruction(word);
		assert.deepEqual(
			[decoded.mnemonic, decoded.width, decoded.statusRegister],
			[mnemonic, width, statusRegister]
		);
	}
});

test("pair-exclusive and malformed load status fields remain unsupported", () => {
	assert.equal(decodeAarch64Instruction(0x887f0440).family, "unknown");
	assert.equal(decodeAarch64Instruction(0x88407c20).family, "unknown");
});

function shape(instruction) {
	const {
		base,
		family,
		mnemonic,
		ordering,
		register,
		statusRegister,
		store,
		width
	} = instruction;
	return {
		base,
		family,
		mnemonic,
		ordering,
		register,
		statusRegister,
		store,
		width
	};
}
