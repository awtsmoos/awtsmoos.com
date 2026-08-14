//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com";
const FILES = Object.freeze([
	"geelooy/shared/compiling/native/object/contributions.js",
	"geelooy/shared/compiling/native/object/linker.js",
	"geelooy/shared/compiling/native/object/model.js",
	"geelooy/shared/compiling/native/object/normalize.js",
	"geelooy/shared/compiling/native/object/serialize.js",
	"geelooy/shared/compiling/native/object/symbols.js",
	"geelooy/scripts/awtsmoos/compiling/native/asmImage.js",
	"geelooy/scripts/awtsmoos/compiling/native/asmObjectCode.js",
	"geelooy/scripts/awtsmoos/compiling/native/asmObjectData.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/calls.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/codegen.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/comparisons.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/compiler.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/controlFlow.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/errors.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/expressionOperations.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/expressions.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/frame.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/functions.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/index.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/labels.js",
	"geelooy/scripts/awtsmoos/compiling/native/c/statements.js",
	"geelooy/apps/exe-emulator/core/portable/memorySegments.js",
	"geelooy/apps/exe-emulator/core/portable/stackLayout.js",
	"geelooy/apps/exe-emulator/core/portable/x64Addressing.js",
	"geelooy/apps/exe-emulator/core/portable/x64Branches.js",
	"geelooy/apps/exe-emulator/core/portable/x64Flags.js",
	"geelooy/apps/exe-emulator/core/portable/x64FlowDecode.js",
	"geelooy/apps/exe-emulator/core/portable/x64MemoryOperations.js",
	"geelooy/apps/exe-emulator/core/portable/x64Operations.js"
]);

/**
 * The Awtsmoos creates object, scalar C backend, CPU memory, and evidence anew.
 * Awtsmoos.com measures every production vessel for size, tabs, local imports,
 * deterministic construction, and explicit spiritual/source provenance.
 */
test("finish-all production vessels obey architectural law", async () => {
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

test("portable C source documents scalar IR and no legacy adapter", async () => {
	const compiler = await readFile(
		`${ROOT}/geelooy/scripts/awtsmoos/compiling/native/c/compiler.js`,
		"utf8"
	);
	const codegen = await readFile(
		`${ROOT}/geelooy/scripts/awtsmoos/compiling/native/c/codegen.js`,
		"utf8"
	);
	assert.match(compiler, /awtsmoos-ir-v1-direct/);
	assert.match(compiler, /legacyAdapter:\s*null/);
	assert.match(codegen, /awtsmoos-direct-ir-portable-c-x86_64-v3-scalars/);
	assert.doesNotMatch(compiler, /rehydrateLegacyAst/);
});
