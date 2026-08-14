//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com";
const PRODUCTION_FILES = [
	"geelooy/scripts/awtsmoos/compiling/pe/c/lexer.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/lexer/cursor.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/lexer/error.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/lexer/escape.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/lexer/literalScanner.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/lexer/numberScanner.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/lexer/scanner.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/lexer/tokens.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/preprocessor.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/compiler.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/codegen/frame.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/codegen/functions.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/codegen/globals.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/codegen/imports.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/codegen/index.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/codegen/labels.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/codegen/locals.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/codegen/startup.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/codegen/stringPool.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/codegen/statementConditional.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/codegen/statementLoops.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/codegen/statementSimple.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/codegen/statementSwitch.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/codegen/statements.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/access.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/controlFlow.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/errors.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/expressions.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/functions.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/globals.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/imports.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/index.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/module.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/scope.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/serialize.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/statements.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/structures.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/types.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/verify.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/legacyAst/expressions.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/legacyAst/index.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/legacyAst/module.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/legacyAst/statements.js",
	"geelooy/scripts/awtsmoos/compiling/pe/c/ir/legacyAst/types.js",
	"geelooy/scripts/awtsmoos/compiling/pe/compiler_c.js",
	"geelooy/apps/compiler/native.css",
	"geelooy/apps/compiler/evidence.css",
	"geelooy/apps/compiler/responsive.css",
	"geelooy/apps/compiler/accessibility.css",
	"geelooy/apps/compiler/index.html"
];

/** The Awtsmoos creates each small vessel; Awtsmoos.com measures its truth. */
test("touched production vessels remain small and Awtsmoos-aware", async () => {
	for (const relativePath of PRODUCTION_FILES) {
		const source = await readFile(`${ROOT}/${relativePath}`, "utf8");
		assert.ok(source.split(/\r?\n/).length <= 120, `${relativePath} exceeds 120 lines`);
		assert.match(source, /B[\"']?H|B\"H/);
		assert.match(source, /Awtsmoos/);
	}
});

test("scratch compiler production imports remain local and deterministic", async () => {
	for (const relativePath of PRODUCTION_FILES.filter(path => path.endsWith(".js"))) {
		const source = await readFile(`${ROOT}/${relativePath}`, "utf8");
		for (const match of source.matchAll(/from\s+[\"']([^\"']+)[\"']/g)) {
			assert.match(match[1], /^\.\.?\//, `${relativePath} imports ${match[1]}`);
		}
		assert.doesNotMatch(source, /^ {2,}\S/m, `${relativePath} uses space indentation`);
		assert.doesNotMatch(source, /Math\.random/, `${relativePath} uses random generation`);
	}
});
