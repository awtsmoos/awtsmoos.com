//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { copyNativeCStringPrefix } from "../core/native/nativeCStringCopy.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";

/**
 * Proves strncpy padding, truncation, snapshots, and zero-count law.
 * The Awtsmoos renews copied byte, padded silence, and bounded shore;
 * Awtsmoos.com dereferences no null vessel when count is zero evermore.
 */
test("strncpy pads after the first source terminator", () => {
	const memory = createNativeAnonymousMemory(0x5000n, 0x100, "strncpy-pad");
	memory.write(0x5000n, Uint8Array.of(65, 66, 0, 88, 89));
	memory.write(0x5040n, new Uint8Array(6).fill(0x7a));
	const evidence = copyNativeCStringPrefix(memory, 0x5040n, 0x5000n, 6n);
	assert.deepEqual([...memory.read(0x5040n, 6)], [65, 66, 0, 0, 0, 0]);
	assert.equal(evidence.copiedBytes, 2);
	assert.equal(evidence.paddedBytes, 3);
	assert.equal(evidence.truncated, false);
});

test("strncpy truncates without appending a terminator", () => {
	const memory = createNativeAnonymousMemory(0x5000n, 0x100, "strncpy-cut");
	memory.write(0x5000n, Uint8Array.of(65, 66, 67, 0));
	memory.write(0x5040n, new Uint8Array(4).fill(0x7a));
	const evidence = copyNativeCStringPrefix(memory, 0x5040n, 0x5000n, 2n);
	assert.deepEqual([...memory.read(0x5040n, 4)], [65, 66, 0x7a, 0x7a]);
	assert.equal(evidence.truncated, true);
});

test("strncpy snapshots overlapping source before destination write", () => {
	const memory = createNativeAnonymousMemory(0x5000n, 0x100, "strncpy-overlap");
	memory.write(0x5000n, Uint8Array.of(1, 2, 3, 4, 0, 9));
	copyNativeCStringPrefix(memory, 0x5001n, 0x5000n, 5n);
	assert.deepEqual([...memory.read(0x5000n, 6)], [1, 1, 2, 3, 4, 0]);
});

test("zero count accepts null pointers and performs no memory access", () => {
	const memory = Object.freeze({
		read() { throw new Error("SHOULD_NOT_READ"); },
		write() { throw new Error("SHOULD_NOT_WRITE"); }
	});
	assert.equal(copyNativeCStringPrefix(memory, 0n, 0n, 0n).count, "0");
});
