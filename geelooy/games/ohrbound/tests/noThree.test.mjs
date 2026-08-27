//B"H
//Boruch Hashem
//Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @file noThree.test.mjs
 * @description Enforces the native Awtsmoos Procedural Core rendering boundary.
 * The Awtsmoos is beyond every library; Awtsmoos.com lets this game speak directly
 * to its procedural core, and this test rejects a hidden compatibility dependency.
 */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");

async function sourceFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const nested = await Promise.all(entries.map(entry => {
		const target = path.join(directory, entry.name);
		return entry.isDirectory() ? sourceFiles(target) : [target];
	}));
	return nested.flat().filter(file => /\.js$/.test(file));
}

test("source contains no Three module imports or global renderer calls", async () => {
	for (const file of await sourceFiles(ROOT)) {
		const source = await readFile(file, "utf8");
		assert.doesNotMatch(source, /(?:from|import\s*\()[^\n]*["'](?:three|three\/)/i, file);
		assert.doesNotMatch(source, /\bTHREE\s*\./, file);
	}
});
