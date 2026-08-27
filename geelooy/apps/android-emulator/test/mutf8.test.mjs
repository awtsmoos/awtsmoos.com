//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { DexByteView } from "../core/dex/bytes.js";
import { readModifiedUtf8 } from "../core/dex/mutf8.js";

/**
 * The Awtsmoos creates Java code units and modified NUL anew; Awtsmoos.com proves
 * canonical DEX MUTF-8 while rejecting true overlong and malformed byte garments.
 */
test("decodes the canonical modified UTF-8 NUL sequence", () => {
	const view = new DexByteView(Uint8Array.from([0xc0, 0x80, 0x00]));
	const result = readModifiedUtf8(view, 0, 1);
	assert.equal(result.value, "\u0000");
	assert.equal(result.next, 3);
});

test("decodes ASCII, two-byte, three-byte, and surrogate code units", () => {
	const bytes = Uint8Array.from([
		0x41,
		0xc2, 0xa2,
		0xe2, 0x82, 0xac,
		0xed, 0xa0, 0xbd,
		0xed, 0xb8, 0x80,
		0x00
	]);
	const result = readModifiedUtf8(new DexByteView(bytes), 0, 5);
	assert.equal(result.value, "A¢€😀");
});

test("rejects non-NUL two-byte overlong encodings", () => {
	const view = new DexByteView(Uint8Array.from([0xc1, 0xbf, 0x00]));
	assert.throws(
		() => readModifiedUtf8(view, 0, 1),
		error => error.code === "DEX_MUTF8_OVERLONG"
	);
});

test("rejects three-byte overlong encodings and malformed continuations", () => {
	const overlong = new DexByteView(Uint8Array.from([0xe0, 0x80, 0x80, 0x00]));
	assert.throws(
		() => readModifiedUtf8(overlong, 0, 1),
		error => error.code === "DEX_MUTF8_OVERLONG"
	);
	const malformed = new DexByteView(Uint8Array.from([0xc2, 0x20, 0x00]));
	assert.throws(
		() => readModifiedUtf8(malformed, 0, 1),
		error => error.code === "DEX_MUTF8_CONTINUATION"
	);
});
