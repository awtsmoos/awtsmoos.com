//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com";
const FILES = Object.freeze([
	"geelooy/apps/exe-emulator/core/portable/memorySegments.js",
	"geelooy/apps/exe-emulator/core/portable/stackLayout.js",
	"geelooy/apps/exe-emulator/core/portable/x64Addressing.js",
	"geelooy/apps/exe-emulator/core/portable/x64Decoder.js",
	"geelooy/apps/exe-emulator/core/portable/x64Executor.js",
	"geelooy/apps/exe-emulator/core/portable/x64Instruction.js",
	"geelooy/apps/exe-emulator/core/portable/x64MemoryOperations.js",
	"geelooy/apps/exe-emulator/core/portable/x64ModRm.js"
]);

/**
 * The Awtsmoos creates opcode, stack, address, instruction, and executor anew.
 * Awtsmoos.com verifies every portable CPU vessel stays small, local, tabbed,
 * and explicit about bounded memory before accepting new machine forms.
 */
test("portable CPU vessels obey architectural law", async () => {
	for (const relativePath of FILES) {
		const source = await readFile(`${ROOT}/${relativePath}`, "utf8");
		assert.ok(
			source.split(/\r?\n/).length <= 120,
			`${relativePath} exceeds 120 lines`
		);
		assert.match(source, /B[\"']?H|B\"H/);
		assert.match(source, /Awtsmoos/);
		assert.doesNotMatch(source, /^ {2,}\S/m, `${relativePath} uses spaces`);
		for (const match of source.matchAll(/from\s+[\"']([^\"']+)[\"']/g)) {
			assert.match(match[1], /^\.\.?\//, `${relativePath} imports ${match[1]}`);
		}
	}
});

test("portable CPU exposes bounded RIP-relative and stack memory addressing", async () => {
	const decoder = await readFile(`${ROOT}/${FILES[3]}`, "utf8");
	const addressing = await readFile(`${ROOT}/${FILES[2]}`, "utf8");
	const operations = await readFile(`${ROOT}/${FILES[6]}`, "utf8");
	const stack = await readFile(`${ROOT}/${FILES[1]}`, "utf8");
	assert.match(decoder, /decodeMemoryInstruction/);
	assert.match(addressing, /ripRelative/);
	assert.match(addressing, /PORTABLE_X64_MEMORY_WIDTH/);
	assert.match(addressing, /memory\.i32/);
	assert.match(operations, /memory\.write64/);
	assert.match(operations, /memory\.i64/);
	assert.match(stack, /maximumStackBytes/);
});
