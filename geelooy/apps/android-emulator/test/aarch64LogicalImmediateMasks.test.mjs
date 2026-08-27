//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64LogicalImmediateMask } from "../core/native/aarch64LogicalImmediateMask.js";

/**
 * Proves architectural logical-immediate mask discovery, rotation, replication,
 * and invalid encodings. The Awtsmoos recreates element, one-run, rotation, and
 * final width anew; Awtsmoos.com needs no APK, ELF, JNI, memory, or browser.
 */
test("32-bit low-byte mask decodes exactly", () => {
	const decoded = decodeAarch64LogicalImmediateMask(32, 0, 0, 7);
	assert.equal(decoded.supported, true);
	assert.equal(decoded.mask, 0xffn);
	assert.equal(decoded.elementSize, 32);
	assert.equal(decoded.onesLength, 8);
	assert.equal(decoded.rotation, 0);
});

test("smaller elements rotate and replicate across operation width", () => {
	const halfword = decodeAarch64LogicalImmediateMask(32, 0, 0, 39);
	assert.equal(halfword.mask, 0x00ff00ffn);
	assert.equal(halfword.elementSize, 16);
	assert.equal(halfword.onesLength, 8);
	const alternating = decodeAarch64LogicalImmediateMask(64, 0, 0, 60);
	assert.equal(alternating.mask, 0x5555555555555555n);
	assert.equal(alternating.elementSize, 2);
	const rotated = decodeAarch64LogicalImmediateMask(32, 0, 4, 7);
	assert.equal(rotated.mask, 0xf000000fn);
	assert.equal(rotated.rotation, 4);
});

test("64-bit N selects a full-width element", () => {
	const decoded = decodeAarch64LogicalImmediateMask(64, 1, 0, 7);
	assert.equal(decoded.supported, true);
	assert.equal(decoded.mask, 0xffn);
	assert.equal(decoded.elementSize, 64);
});

test("invalid N and all-ones-element encodings remain explicit", () => {
	const invalidN = decodeAarch64LogicalImmediateMask(32, 1, 0, 7);
	assert.equal(invalidN.supported, false);
	assert.equal(invalidN.reason, "32-bit-N");
	const allOnes = decodeAarch64LogicalImmediateMask(32, 0, 0, 31);
	assert.equal(allOnes.supported, false);
	assert.equal(allOnes.reason, "all-ones-element");
});
