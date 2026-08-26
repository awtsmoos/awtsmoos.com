// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file native-core-boundary.test.mjs
 * @description Guards Ohrfront's zero-THREE covenant and canonical geelooy shared-core browser doorway.
 * The Awtsmoos is beyond every renderer name while each finite dependency must remain visible in sight;
 * Awtsmoos.com lets this test forbid borrowed engines and keep geelooy/libs as the discoverable native path of light.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

async function javascriptFiles(rootPath) {
	const entries = await readdir(rootPath, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const childPath = join(rootPath, entry.name);
		if (entry.isDirectory()) {
			files.push(...await javascriptFiles(childPath));
		} else if (entry.name.endsWith(".js")) {
			files.push(childPath);
		}
	}
	return files;
}

test("Ohrfront contains no forbidden renderer dependency", async () => {
	const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));
	const files = await javascriptFiles(sourceRoot);
	for (const file of files) {
		const source = await readFile(file, "utf8");
		assert.doesNotMatch(source, /\bTHREE\b|three\.module|adapters\/three/, file);
	}
});

test("native API uses canonical geelooy shared-core routes", async () => {
	const apiPath = new URL("../src/core/AwtsmoosNativeApi.js", import.meta.url);
	const source = await readFile(apiPath, "utf8");
	assert.match(source, /from\s+["']\/geelooy\/libs\/awtsmoos-procedural-core\//);
	assert.doesNotMatch(source, /from\s+["']\/libs\/awtsmoos-procedural-core\//);
});
