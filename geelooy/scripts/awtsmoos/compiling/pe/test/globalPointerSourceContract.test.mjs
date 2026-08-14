//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com";
const FILES = Object.freeze([
	"geelooy/scripts/awtsmoos/compiling/pe/c/parser/declarations.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/expressions.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/globals.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/storage.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/frame.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/codegen.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/functions.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/expressions.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/expressionOperations.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/updates.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/compiler.js"
]);

/**
 * The Awtsmoos creates global storage, pointer type, lvalue, and compiler evidence
 * anew. Awtsmoos.com measures every scalar-storage vessel independently so mutable
 * addresses never become hidden, oversized, or host-dependent machinery.
 */
test("global and pointer vessels obey architectural law", async () => {
	for (const relativePath of FILES) {
		const source = await readFile(`${ROOT}/${relativePath}`, "utf8");
		assert.ok(
			source.split(/\r?\n/).length <= 120,
			`${relativePath} exceeds 120 lines`
		);
		assert.match(source, /B[\"']?H|B\"H/);
		assert.match(source, /Awtsmoos/);
		assert.doesNotMatch(source, /^ {2,}\S/m, `${relativePath} uses spaces`);
		assert.doesNotMatch(source, /Math\.random/, `${relativePath} uses randomness`);
		for (const match of source.matchAll(/from\s+[\"']([^\"']+)[\"']/g)) {
			assert.match(match[1], /^\.\.?\//, `${relativePath} imports ${match[1]}`);
		}
	}
});

test("global storage source uses object symbols and permissioned memory", async () => {
	const globals = await readFile(`${ROOT}/${FILES[2]}`, "utf8");
	const storage = await readFile(`${ROOT}/${FILES[3]}`, "utf8");
	const compiler = await readFile(`${ROOT}/${FILES[10]}`, "utf8");
	assert.match(globals, /global-address/);
	assert.match(globals, /setBigInt64/);
	assert.match(storage, /LEA R10/);
	assert.match(storage, /QWORD PTR \[R10\]/);
	assert.match(storage, /emitStoreDestination/);
	assert.match(compiler, /globals-stack-pointers-v1/);
});

test("pointer arithmetic remains an explicit coded boundary", async () => {
	const operations = await readFile(`${ROOT}/${FILES[8]}`, "utf8");
	assert.match(operations, /PORTABLE_C_POINTER_ARITHMETIC_UNSUPPORTED/);
	assert.match(operations, /pointerOperand/);
});
