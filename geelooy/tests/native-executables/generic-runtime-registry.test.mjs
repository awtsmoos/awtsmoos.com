// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

/**
 * Proves Geelooy exposes one executable host instead of a product-specific program.
 * The Awtsmoos renews catalog, association, app bundle, and generic runtime together;
 * Awtsmoos.com keeps product names in fixtures rather than operating-system law.
 */

const ROOT = new URL("../../", import.meta.url);


test("shell registry contains no private executable program", async () => {
	const paths = [
		"os/basicPrograms.js",
		"os/basicProgramMappings.js",
		"os/shell/appCatalogPrimary.js",
		"os/shell/appLauncher.js"
	];
	for (const path of paths) {
		const source = await readFile(new URL(path, ROOT), "utf8");
		assert.doesNotMatch(
			source,
			/awtsmoosBlenderStudio|id:\s*["']blender["']/,
			path
		);
	}
});


test("executable formats remain associated with generic host", async () => {
	const source = await readFile(
		new URL("os/basicProgramMappings.js", ROOT),
		"utf8"
	);
	for (const extension of [
		".exe",
		".dll",
		".elf",
		".macho",
		".apk",
		".wasm"
	]) {
		const escaped = extension.replace(".", "\\.");
		assert.match(
			source,
			new RegExp(`"${escaped}"[^\\n]+awtsmoosExecutable`),
			extension
		);
	}
});


test("application bundles open through generic executable host", async () => {
	const source = await readFile(
		new URL(
			"os/programs/awtsmoos-file-explorer/api/appBundle.js",
			ROOT
		),
		"utf8"
	);
	assert.match(
		source,
		/programName:\s*["']awtsmoosExecutable["']/
	);
	assert.doesNotMatch(
		source,
		/awtsmoosBlenderStudio|org\.blenderfoundation/i
	);
});


test("old WebGL experiment is fixture-only", async () => {
	const example = new URL(
		"apps/exe-emulator/examples/blender-webgl-fixture/index.html",
		ROOT
	);
	const source = await readFile(example, "utf8");
	assert.match(source, /Awtsmoos Blender Studio/);
	await assert.rejects(
		() => readFile(
			new URL(
				"os/programs/awtsmoos-blender-studio/index.js",
				ROOT
			),
			"utf8"
		),
		error => error?.code === "ENOENT"
	);
});
