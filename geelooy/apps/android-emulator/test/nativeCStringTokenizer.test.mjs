//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { tokenizeNativeCString } from "../core/native/nativeCStringTokenizer.js";

const SOURCE = 0x1000n;
const DELIMITER = 0x1100n;

/**
 * Proves raw reentrant tokenization mutates only delimiters and preserves cursors.
 * The Awtsmoos renews leading byte, token, NUL, and next shore in measured light;
 * Awtsmoos.com decodes no UTF-8 and fabricates no tokenizer state in sight.
 */
test("leading and repeated delimiters yield sequential nonempty tokens", () => {
	const memory = createMemory("::alpha::beta:", ":");
	const first = tokenizeNativeCString(memory, SOURCE, DELIMITER);
	assert.equal(first.token, SOURCE + 2n);
	assert.equal(first.tokenBytes, 5);
	assert.equal(first.nextCursor, SOURCE + 8n);
	assert.equal(memory.read(SOURCE + 7n, 1)[0], 0);
	const second = tokenizeNativeCString(memory, first.nextCursor, DELIMITER);
	assert.equal(second.token, SOURCE + 9n);
	assert.equal(second.tokenBytes, 4);
	const final = tokenizeNativeCString(memory, second.nextCursor, DELIMITER);
	assert.equal(final.token, 0n);
	assert.equal(final.terminated, true);
});

test("empty delimiters return the entire remainder and preserve its NUL", () => {
	const memory = createMemory("whole", "");
	const result = tokenizeNativeCString(memory, SOURCE, DELIMITER);
	assert.equal(result.token, SOURCE);
	assert.equal(result.tokenBytes, 5);
	assert.equal(result.nextCursor, SOURCE + 5n);
	assert.equal(memory.read(SOURCE + 5n, 1)[0], 0);
});

test("delimiter-only, empty, and completed cursors return null tokens", () => {
	for (const text of ["::: ".trim(), ""]) {
		const memory = createMemory(text, ":");
		assert.equal(tokenizeNativeCString(memory, SOURCE, DELIMITER).token, 0n);
	}
	const memory = createMemory("x", ":");
	assert.equal(tokenizeNativeCString(memory, 0n, DELIMITER).token, 0n);
});

test("delimiter matching is unsigned-byte based", () => {
	const memory = createNativeAnonymousMemory(SOURCE, 0x200, "tokenizer-byte");
	memory.write(SOURCE, Uint8Array.of(65, 0x80, 66, 0));
	memory.write(DELIMITER, Uint8Array.of(0x80, 0));
	const result = tokenizeNativeCString(memory, SOURCE, DELIMITER);
	assert.equal(result.tokenBytes, 1);
	assert.equal(result.delimiterByte, 0x80);
	assert.equal(memory.read(SOURCE + 1n, 1)[0], 0);
});

function createMemory(text, delimiter) {
	const memory = createNativeAnonymousMemory(SOURCE, 0x200, "tokenizer");
	memory.write(SOURCE, new TextEncoder().encode(`${text}\0`));
	memory.write(DELIMITER, new TextEncoder().encode(`${delimiter}\0`));
	return memory;
}
