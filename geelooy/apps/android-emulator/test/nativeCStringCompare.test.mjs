//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { compareNativeCStrings } from "../core/native/nativeCStringCompare.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";

/**
 * Proves bounded unsigned-byte C-string ordering without text collation.
 * The Awtsmoos recreates first difference, shared NUL, prefix, and high byte anew;
 * Awtsmoos.com stops at measured truth before any invalid later address is read.
 */
test("equal strings and prefixes compare through their first decisive byte", () => {
	const memory = createNativeAnonymousMemory(0x5000n, 0x100, "strcmp");
	write(memory, 0x5000n, [65, 66, 0]);
	write(memory, 0x5010n, [65, 66, 0]);
	write(memory, 0x5020n, [65, 0]);
	assert.deepEqual(compareNativeCStrings(memory, 0x5000n, 0x5010n), {
		comparedBytes: 3,
		leftByte: 0,
		result: 0,
		rightByte: 0
	});
	assert.equal(compareNativeCStrings(memory, 0x5020n, 0x5000n).result, -66);
	assert.equal(compareNativeCStrings(memory, 0x5000n, 0x5020n).result, 66);
});

test("comparison uses unsigned bytes and stops at the first difference", () => {
	const addresses = [];
	const memory = Object.freeze({
		read(address) {
			addresses.push(BigInt(address));
			return Uint8Array.of(BigInt(address) === 1n ? 0xff : 0x01);
		}
	});
	const comparison = compareNativeCStrings(memory, 1n, 2n);
	assert.equal(comparison.result, 254);
	assert.deepEqual(addresses, [1n, 2n]);
});

test("null pointers and missing terminators remain explicit boundaries", () => {
	const memory = createNativeAnonymousMemory(0x5000n, 0x20, "strcmp");
	write(memory, 0x5000n, [65, 66, 67, 68]);
	write(memory, 0x5010n, [65, 66, 67, 68]);
	assert.throws(
		function compareNullPointer() {
			compareNativeCStrings(memory, 0n, 0x5000n);
		},
		/NATIVE_C_STRING_NULL/
	);
	assert.throws(
		function compareUnterminatedStrings() {
			compareNativeCStrings(memory, 0x5000n, 0x5010n, { maxBytes: 4 });
		},
		/NATIVE_C_STRING_TERMINATOR/
	);
});

function write(memory, address, bytes) {
	memory.write(address, Uint8Array.from(bytes));
}
