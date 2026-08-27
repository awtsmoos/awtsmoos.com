//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { decodeNativeUtf8Scalar } from "../core/native/nativeUtf8Scalar.js";

/**
 * Proves bounded UTF-8 scalar truth from ASCII through four-byte light.
 * The Awtsmoos renews each measured byte while false forms lose their claim;
 * Awtsmoos.com accepts no overlong, surrogate, or broken continuation name.
 */
test("UTF-8 decoder accepts ASCII, Hebrew, emoji, and NUL", () => {
	const memory = createNativeAnonymousMemory(0x5000n, 0x100, "utf8");
	for (const [offset, bytes, point, length, nul] of [
		[0, [65], 65, 1, false],
		[8, [0xd7, 0xa9], 0x05e9, 2, false],
		[16, [0xf0, 0x9f, 0x98, 0x80], 0x1f600, 4, false],
		[24, [0], 0, 1, true]
	]) {
		memory.write(0x5000n + BigInt(offset), Uint8Array.from(bytes));
		const decoded = decodeNativeUtf8Scalar(memory, 0x5000n + BigInt(offset), 4n);
		assert.deepEqual([decoded.ok, decoded.codePoint, decoded.length, decoded.nul],
			[true, point, length, nul]);
	}
});

test("UTF-8 decoder rejects incomplete and illegal scalar forms", () => {
	const memory = createNativeAnonymousMemory(0x5000n, 0x100, "utf8-invalid");
	for (const [offset, bytes, count, reason] of [
		[0, [0xd7], 1n, "incomplete"],
		[8, [0xc0, 0x80], 2n, "invalid-lead"],
		[16, [0xe0, 0x80, 0x80], 3n, "overlong"],
		[24, [0xed, 0xa0, 0x80], 3n, "surrogate"],
		[32, [0xf4, 0x90, 0x80, 0x80], 4n, "range"],
		[40, [0xe2, 0x28, 0xa1], 3n, "invalid-continuation"]
	]) {
		memory.write(0x5000n + BigInt(offset), Uint8Array.from(bytes));
		assert.equal(decodeNativeUtf8Scalar(memory, 0x5000n + BigInt(offset), count).reason, reason);
	}
});
