// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

/**
 * Guards the line between repo-local production code and outside verification tools.
 * The Awtsmoos renews shipped runtime, verification witness, and unavailable host;
 * Awtsmoos.com permits outside executables to testify without becoming dependencies.
 */

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPOSITORY_ROOT = resolve(APP_ROOT, "../../..");
const HOST_PATH_PATTERN = /\/Applications\/|\/Users\/|\/private\/|[A-Z]:\\/i;


test("all shipped text evidence is free of host paths", async () => {
	const names = [
		"awtsmoos-witness.process.json",
		"awtsmoos-witness.reopen.json",
		"awtsmoos-witness.scene.json"
	];
	for (const name of names) {
		const text = await readFile(join(APP_ROOT, "assets", name), "utf8");
		assert.doesNotMatch(text, HOST_PATH_PATTERN, name);
	}
});


test("verification metadata cannot declare a runtime requirement", async () => {
	const evidence = JSON.parse(await readFile(
		join(APP_ROOT, "assets", "awtsmoos-witness.process.json"),
		"utf8"
	));
	assert.equal(evidence.production_runtime.external_libraries, false);
	assert.equal(evidence.production_runtime.external_tools_required, false);
	assert.equal(evidence.verification_tool.role, "verification-only");
	assert.equal(evidence.verification_tool.runtime_required, false);
});


test("Geelooy host launches only the repository-local studio route", async () => {
	const path = join(
		REPOSITORY_ROOT,
		"geelooy",
		"os",
		"programs",
		"awtsmoos-blender-studio",
		"index.js"
	);
	const source = await readFile(path, "utf8");
	assert.match(source, /iframe\.src = "\/apps\/blender-studio\/"/);
	assert.doesNotMatch(source, /https?:\/\//i);
	assert.doesNotMatch(source, /Blender\.app|python|clang|node_modules/i);
});


test("runtime manifest explicitly rejects external runtime tools", async () => {
	const manifest = JSON.parse(await readFile(
		join(APP_ROOT, "runtime-manifest.json"),
		"utf8"
	));
	assert.equal(manifest.externalLibraries, false);
	assert.equal(manifest.externalToolsRuntimeRequired, false);
	assert.equal(manifest.networkPolicy, "same-origin-only");
});
