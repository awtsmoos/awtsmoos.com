//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { adler32 } from "../core/dex/hashes.js";

/**
 * Computes the deliberately slow byte-wise definition used only as a test oracle.
 * This implementation mirrors the original emulator behavior so optimized runtime
 * code must remain bit-for-bit identical across block boundaries and random bytes.
 *
 * @param {Uint8Array} bytes Input bytes.
 * @returns {number} Unsigned Adler-32 value.
 */
function referenceAdler32(bytes) {
	let first = 1;
	let second = 0;
	for (const byte of bytes) {
		first = (first + byte) % 65521;
		second = (second + first) % 65521;
	}
	return ((second << 16) | first) >>> 0;
}

/** Creates deterministic nontrivial bytes without depending on host randomness. */
function deterministicBytes(length, seed = 1) {
	const bytes = new Uint8Array(length);
	let state = seed >>> 0;
	for (let index = 0; index < bytes.length; index += 1) {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		bytes[index] = state >>> 24;
	}
	return bytes;
}

/** Proves the optimized function preserves standard known Adler-32 vectors. */
test("Adler-32 matches canonical empty and Wikipedia vectors", () => {
	assert.equal(adler32(new Uint8Array()), 1);
	const wikipedia = new TextEncoder().encode("Wikipedia");
	assert.equal(adler32(wikipedia), 0x11e60398);
});

/**
 * Proves bounded modulo reduction remains identical around every critical block edge.
 */
test("Adler-32 matches byte-wise definition across block boundaries", () => {
	for (const length of [1, 2, 255, 5551, 5552, 5553, 11104, 12001]) {
		const bytes = deterministicBytes(length, length + 17);
		assert.equal(adler32(bytes), referenceAdler32(bytes), `length ${length}`);
	}
});

/** Proves many deterministic byte distributions remain bit-for-bit equivalent. */
test("Adler-32 matches reference across deterministic varied buffers", () => {
	for (let seed = 1; seed <= 24; seed += 1) {
		const length = seed * 997;
		const bytes = deterministicBytes(length, seed);
		assert.equal(adler32(bytes), referenceAdler32(bytes), `seed ${seed}`);
	}
});
