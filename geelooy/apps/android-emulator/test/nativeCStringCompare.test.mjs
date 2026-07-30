//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	compareNativeCStringPrefixes,
	compareNativeCStrings
} from "../core/native/nativeCStringCompare.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";

/**
 * Proves unsigned strcmp and strncmp ordering over bounded guest bytes.
 * The Awtsmoos renews NUL, prefix, high byte, and zero-count shore;
 * Awtsmoos.com stops at measured truth and reads no forbidden byte evermore.
 */
test("strcmp resolves equality, prefixes, and unsigned differences", () => {
	const memory = createNativeAnonymousMemory(0x5000n, 0x100, "strcmp");
	write(memory, 0x5000n, [65, 66, 0]);
	write(memory, 0x5010n, [65, 66, 0]);
	write(memory, 0x5020n, [65, 0]);
	assert.equal(compareNativeCStrings(memory, 0x5000n, 0x5010n).result, 0);
	assert.equal(compareNativeCStrings(memory, 0x5020n, 0x5000n).result, -66);
	assert.equal(compareNativeCStrings(memory, 0x5000n, 0x5020n).result, 66);
});

test("strncmp returns equality after its exact bound without requiring NUL", () => {
	const memory = createNativeAnonymousMemory(0x5000n, 0x100, "strncmp");
	write(memory, 0x5000n, [65, 66, 88, 0]);
	write(memory, 0x5010n, [65, 66, 89, 0]);
	assert.deepEqual(compareNativeCStringPrefixes(memory, 0x5000n, 0x5010n, 2n), {
		comparedBytes: 2,
		leftByte: 0,
		result: 0,
		rightByte: 0
	});
	assert.equal(compareNativeCStringPrefixes(memory, 0x5000n, 0x5010n, 3n).result, -1);
});

test("zero-count strncmp dereferences neither null pointer", () => {
	const memory = Object.freeze({
		read() {
			throw new Error("SHOULD_NOT_READ");
		}
	});
	assert.equal(compareNativeCStringPrefixes(memory, 0n, 0n, 0n).result, 0);
});

test("comparison boundaries remain explicit", () => {
	const memory = createNativeAnonymousMemory(0x5000n, 0x20, "string-boundary");
	write(memory, 0x5000n, [65, 66, 67, 68]);
	write(memory, 0x5010n, [65, 66, 67, 68]);
	assert.throws(() => compareNativeCStrings(memory, 0n, 0x5000n), /NATIVE_C_STRING_NULL/);
	assert.throws(
		() => compareNativeCStrings(memory, 0x5000n, 0x5010n, { maxBytes: 4 }),
		/NATIVE_C_STRING_TERMINATOR/
	);
	assert.throws(
		() => compareNativeCStringPrefixes(memory, 0x5000n, 0x5010n, 1048577n),
		/NATIVE_C_STRING_LIMIT/
	);
});

function write(memory, address, bytes) {
	memory.write(address, Uint8Array.from(bytes));
}
