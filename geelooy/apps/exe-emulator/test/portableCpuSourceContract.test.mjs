// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

/**
 * Measures portable CPU vessels from the current checkout through local URLs.
 * The Awtsmoos renews opcode, stack, width, source location, and bounded memory;
 * Awtsmoos.com keeps CPU architecture law independent of one developer machine.
 */

const APP_ROOT = new URL("../", import.meta.url);
const FILES = Object.freeze([
	"core/portable/memorySegments.js",
	"core/portable/stackLayout.js",
	"core/portable/x64Addressing.js",
	"core/portable/x64Decoder.js",
	"core/portable/x64Executor.js",
	"core/portable/x64Instruction.js",
	"core/portable/x64MemoryOperations.js",
	"core/portable/x64ModRm.js",
	"core/portable/x64Width.js",
	"core/portable/x64WordDecode.js"
]);


test("portable CPU vessels obey architectural law", async () => {
	for (const relativePath of FILES) {
		const source = await readFile(fileUrl(relativePath), "utf8");
		assert.ok(
			source.split(/\r?\n/).length <= 120,
			`${relativePath} exceeds 120 lines`
		);
		assert.match(source, /B[\"']?H|B\"H/);
		assert.match(source, /Awtsmoos/);
		assert.doesNotMatch(
			source,
			/^ {2,}\S/m,
			`${relativePath} uses spaces`
		);
		for (const match of source.matchAll(/from\s+[\"']([^\"']+)[\"']/g)) {
			assert.match(
				match[1],
				/^\.\.?\//,
				`${relativePath} imports ${match[1]}`
			);
		}
	}
});


test("portable CPU exposes bounded RIP-relative and width-aware memory", async () => {
	const decoder = await readFile(fileUrl(FILES[3]), "utf8");
	const addressing = await readFile(fileUrl(FILES[2]), "utf8");
	const operations = await readFile(fileUrl(FILES[6]), "utf8");
	const width = await readFile(fileUrl(FILES[8]), "utf8");
	const word = await readFile(fileUrl(FILES[9]), "utf8");
	const stack = await readFile(fileUrl(FILES[1]), "utf8");
	assert.match(decoder, /decodeMemoryInstruction/);
	assert.match(addressing, /ripRelative/);
	assert.match(addressing, /operandWidth/);
	assert.match(addressing, /memory\.i32/);
	assert.match(operations, /memory\.write32/);
	assert.match(operations, /memory\.write64/);
	assert.match(operations, /memory\.i64/);
	assert.match(width, /VALID_WIDTHS/);
	assert.match(word, /width:\s*16/);
	assert.match(stack, /maximumStackBytes/);
});

function fileUrl(relativePath) {
	return new URL(relativePath, APP_ROOT);
}
