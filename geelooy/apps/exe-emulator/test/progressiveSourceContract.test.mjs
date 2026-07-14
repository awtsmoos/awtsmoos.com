//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
	COMPILER_CONTRACT_FILES,
	CORE_CONTRACT_FILES,
	EXAMPLE_CONTRACT_FILES
} from "./progressiveContractFiles.mjs";

const ROOT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com";
const ALL_FILES = Object.freeze([
	...CORE_CONTRACT_FILES,
	...EXAMPLE_CONTRACT_FILES,
	...COMPILER_CONTRACT_FILES
]);

/**
 * The Awtsmoos creates bundle, corpus, Win32 family, Mach-O loader, CPU width,
 * TLS, heap, and import runtime anew. Awtsmoos.com measures every vessel so large
 * application progress never becomes hidden or oversized machinery.
 */
test("progressive production vessels obey architectural law", async () => {
	for (const relativePath of ALL_FILES) {
		const source = await readFile(fullPath(relativePath), "utf8");
		assert.ok(source.split(/\r?\n/).length <= 120, `${relativePath} exceeds 120 lines`);
		assert.match(source, /B[\"']?H|B\"H/);
		assert.match(source, /Awtsmoos/);
		assert.doesNotMatch(source, /^ {2,}\S/m, `${relativePath} uses spaces`);
		assert.doesNotMatch(source, /Math\.random/, `${relativePath} uses randomness`);
		assertImports(relativePath, source);
	}
});

test("production bundle and runtime code contains no Blender special case", async () => {
	for (const relativePath of CORE_CONTRACT_FILES) {
		const source = await readFile(fullPath(relativePath), "utf8");
		assert.doesNotMatch(source, /Blender/i, relativePath);
		assert.doesNotMatch(source, /org\.blender/i, relativePath);
	}
});

test("runtime source preserves explicit boundaries and evidence", async () => {
	const portable = await readFile(fullPath("core/portableRuntime.js"), "utf8");
	const imports = await readFile(fullPath("core/portable/darwinImportHost.js"), "utf8");
	const tls = await readFile(fullPath("core/portable/virtualTlsRuntime.js"), "utf8");
	assert.match(portable, /runPortableArtifact/);
	assert.match(portable, /attemptPortableExecution/);
	assert.match(imports, /PORTABLE_IMPORT_UNIMPLEMENTED/);
	assert.match(tls, /PORTABLE_TLS_OFFSET_RANGE/);
});

function fullPath(relativePath) {
	return `${ROOT}/geelooy/apps/exe-emulator/${relativePath}`;
}

function assertImports(relativePath, source) {
	const nodeOnly = relativePath.includes("examples/bundles/");
	for (const match of source.matchAll(/from\s+[\"']([^\"']+)[\"']/g)) {
		const importPath = match[1];
		const valid = /^\.\.?\//.test(importPath)
			|| (nodeOnly && importPath.startsWith("node:"));
		assert.equal(valid, true, `${relativePath} imports ${importPath}`);
	}
}
