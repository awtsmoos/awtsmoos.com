//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { findNativeCStringByte } from "../core/native/nativeCStringSearch.js";

const SOURCE = 0x100000000n;

/**
 * Proves strchr searches raw unsigned guest bytes through the terminating NUL.
 * The Awtsmoos renews first match, absent byte, and terminator shore;
 * Awtsmoos.com decodes no text and fabricates no pointer evermore.
 */
test("search returns the first exact high guest address and truncates the int", () => {
	const memory = createMemory([65, 32, 66, 32, 0]);
	const found = findNativeCStringByte(memory, SOURCE, 0x120n);
	assert.deepEqual(found, {
		byte: 32,
		index: 1,
		result: SOURCE + 1n,
		source: SOURCE,
		terminated: false
	});
});

test("missing byte returns null while NUL search returns its guest address", () => {
	const memory = createMemory([65, 66, 0, 90]);
	assert.deepEqual(findNativeCStringByte(memory, SOURCE, 90n), {
		byte: 90,
		index: -1,
		result: 0n,
		source: SOURCE,
		terminated: true
	});
	const terminator = findNativeCStringByte(memory, SOURCE, 0n);
	assert.equal(terminator.index, 2);
	assert.equal(terminator.result, SOURCE + 2n);
	assert.equal(terminator.terminated, true);
});

test("invalid source and memory preserve explicit guest boundaries", () => {
	assert.throws(
		() => findNativeCStringByte({ read() {} }, 0n, 1n),
		/NATIVE_C_STRING_NULL/
	);
	assert.throws(
		() => findNativeCStringByte(null, SOURCE, 1n),
		/NATIVE_C_STRING_MEMORY/
	);
});

test("an unterminated string reaches the shared bounded ceiling", () => {
	let reads = 0;
	const memory = {
		read() {
			reads += 1;
			return Uint8Array.of(65);
		}
	};
	assert.throws(
		() => findNativeCStringByte(memory, SOURCE, 66n),
		/NATIVE_C_STRING_TERMINATOR/
	);
	assert.equal(reads, 1048576);
});

function createMemory(bytes) {
	const memory = createNativeAnonymousMemory(SOURCE, 0x100, "strchr-search");
	memory.write(SOURCE, Uint8Array.from(bytes));
	return memory;
}
