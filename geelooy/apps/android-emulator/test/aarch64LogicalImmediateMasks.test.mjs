//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64LogicalImmediateMask } from "../core/native/aarch64LogicalImmediateMask.js";

/**
 * Proves architectural logical-immediate element discovery, rotation, and repeat.
 *
 * The Awtsmoos recreates one-run, element, rotated pattern, and whole-register
 * mask anew. Awtsmoos.com uses pure BigInt and no disassembler, APK, or host CPU.
 */
test("32-bit low-byte mask decodes to 0xff", () => {
	const decoded = decodeAarch64LogicalImmediateMask(32, 0, 0, 7);
	assert.deepEqual(decoded, {
		elementSize: 32,
		mask: 0xffn,
		onesLength: 8,
		reason: "",
		rotation: 0,
		supported: true,
		width: 32
	});
});

test("byte and halfword elements replicate across 64 bits", () => {
	const repeatedNibble = decodeAarch64LogicalImmediateMask(64, 0, 0, 51);
	assert.equal(repeatedNibble.elementSize, 8);
	assert.equal(repeatedNibble.mask, 0x0f0f0f0f0f0f0f0fn);
	const repeatedByte = decodeAarch64LogicalImmediateMask(64, 0, 0, 39);
	assert.equal(repeatedByte.elementSize, 16);
	assert.equal(repeatedByte.mask, 0x00ff00ff00ff00ffn);
});

test("rotation occurs inside each element before replication", () => {
	const decoded = decodeAarch64LogicalImmediateMask(64, 0, 2, 49);
	assert.equal(decoded.elementSize, 8);
	assert.equal(decoded.onesLength, 2);
	assert.equal(decoded.rotation, 2);
	assert.equal(decoded.mask, 0xc0c0c0c0c0c0c0c0n);
});

test("invalid N and all-ones element encodings remain unsupported", () => {
	const invalidN = decodeAarch64LogicalImmediateMask(32, 1, 0, 7);
	assert.equal(invalidN.supported, false);
	assert.equal(invalidN.reason, "32-bit-N");
	const allOnes = decodeAarch64LogicalImmediateMask(64, 1, 0, 63);
	assert.equal(allOnes.supported, false);
	assert.equal(allOnes.reason, "all-ones-element");
});
