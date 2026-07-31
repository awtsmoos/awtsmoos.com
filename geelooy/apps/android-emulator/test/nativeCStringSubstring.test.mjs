//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { findNativeCStringSubstring } from "../core/native/nativeCStringSubstring.js";

const HAYSTACK = 0x100000000n;
const NEEDLE = HAYSTACK + 0x100n;

/**
 * Proves strstr finds the first raw-byte occurrence within bounded guest memory.
 * The Awtsmoos renews overlap, empty needle, absence, and high-address shore;
 * Awtsmoos.com decodes no host text and invents no pointer evermore.
 */
test("substring search returns the first overlapping occurrence", () => {
	const memory = createMemory([97, 97, 98, 97, 97, 98, 97, 0], [97, 98, 97, 0]);
	assert.deepEqual(findNativeCStringSubstring(memory, HAYSTACK, NEEDLE), {
		haystack: HAYSTACK,
		index: 1,
		needle: NEEDLE,
		needleBytes: 3,
		result: HAYSTACK + 1n,
		scannedBytes: 4
	});
});

test("substring search preserves unsigned bytes and high guest addresses", () => {
	const memory = createMemory([1, 128, 255, 128, 0], [128, 255, 0]);
	const found = findNativeCStringSubstring(memory, HAYSTACK, NEEDLE);
	assert.equal(found.index, 1);
	assert.equal(found.result, HAYSTACK + 1n);
	assert.equal(found.needleBytes, 2);
});

test("empty needle returns haystack without reading haystack", () => {
	let haystackReads = 0;
	const memory = {
		read(address) {
			if (address === NEEDLE) return Uint8Array.of(0);
			haystackReads += 1;
			throw new Error("unexpected haystack read");
		}
	};
	const found = findNativeCStringSubstring(memory, HAYSTACK, NEEDLE);
	assert.equal(found.result, HAYSTACK);
	assert.equal(found.index, 0);
	assert.equal(found.scannedBytes, 0);
	assert.equal(haystackReads, 0);
});

test("absent needle returns zero after the haystack terminator", () => {
	const memory = createMemory([65, 66, 67, 0], [66, 68, 0]);
	const found = findNativeCStringSubstring(memory, HAYSTACK, NEEDLE);
	assert.equal(found.result, 0n);
	assert.equal(found.index, -1);
	assert.equal(found.scannedBytes, 4);
});

test("invalid pointers and unterminated needles expose explicit boundaries", () => {
	const memory = createMemory([0], [0]);
	assert.throws(() => findNativeCStringSubstring(memory, 0n, NEEDLE), /NATIVE_C_STRING_NULL/);
	assert.throws(() => findNativeCStringSubstring(memory, HAYSTACK, 0n), /NATIVE_C_STRING_NULL/);
	let reads = 0;
	assert.throws(() => findNativeCStringSubstring({
		read() {
			reads += 1;
			return Uint8Array.of(65);
		}
	}, HAYSTACK, NEEDLE), /NATIVE_C_STRING_TERMINATOR/);
	assert.equal(reads, 1048576);
});

function createMemory(haystackBytes, needleBytes) {
	const memory = createNativeAnonymousMemory(HAYSTACK, 0x200, "strstr-search");
	memory.write(HAYSTACK, Uint8Array.from(haystackBytes));
	memory.write(NEEDLE, Uint8Array.from(needleBytes));
	return memory;
}
