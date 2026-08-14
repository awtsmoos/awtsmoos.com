//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com";
const FILES = Object.freeze([
	"geelooy/scripts/awtsmoos/compiling/pe/c/lexer/tokens.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/parser/expressionPrimary.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/parser/expressions.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/access.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/expressions.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/legacyAst/expressions.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/integerOperations.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/expressionOperations.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/updates.js",
	"geelooy/apps/exe-emulator/core/portable/x64Integer.js",
	"geelooy/apps/exe-emulator/core/portable/x64GroupDecode.js",
	"geelooy/apps/exe-emulator/core/portable/x64MultiplyDivide.js"
]);

/**
 * The Awtsmoos creates token, precedence, update, integer operation, and CPU
 * evidence anew. Awtsmoos.com measures each new vessel independently so broad
 * arithmetic never becomes an excuse for oversized or hidden source machinery.
 */
test("integer and update vessels obey architectural law", async () => {
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

test("parser and IR preserve exact update identity", async () => {
	const primary = await readFile(`${ROOT}/${FILES[1]}`, "utf8");
	const expressions = await readFile(`${ROOT}/${FILES[2]}`, "utf8");
	const irAccess = await readFile(`${ROOT}/${FILES[3]}`, "utf8");
	const updates = await readFile(`${ROOT}/${FILES[8]}`, "utf8");
	assert.match(primary, /prefix:\s*false/);
	assert.match(expressions, /prefix:\s*true/);
	assert.match(irAccess, /lowerUpdateExpression/);
	assert.match(updates, /node\.prefix/);
	assert.match(updates, /MOV RBX, RAX/);
});

test("integer CPU source names bounded arithmetic failures", async () => {
	const integer = await readFile(`${ROOT}/${FILES[9]}`, "utf8");
	const multiplyDivide = await readFile(`${ROOT}/${FILES[11]}`, "utf8");
	assert.match(integer, /PORTABLE_DIVIDE_BY_ZERO/);
	assert.match(integer, /PORTABLE_INTEGER_UNSAFE/);
	assert.match(multiplyDivide, /PORTABLE_UNSIGNED_DIVIDE_RANGE/);
});
