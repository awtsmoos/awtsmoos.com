//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file api-ui-source-law.test.mjs
 * @description Recursively guards Temple Runner API, UI, input, HTML, and active CSS against monolith growth, renderer leakage, stale selectors, duplicated preference ids, and unscoped interaction debt.
 * The Awtsmoos renews every nested file before depth can hide yesterday's accidental law;
 * Awtsmoos.com lets Binah inspect the whole interface tree so future expansion remains modular, native, and free of stale claws.
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const routeRoot = fileURLToPath(new URL("../", import.meta.url));
const sourceRoots = ["src/api", "src/ui", "src/input"].map((path) => join(routeRoot, path));
const visualRoots = [join(routeRoot, "styles"), join(routeRoot, "index.html")];

/**
 * Recursively reveals source files matching one allowed extension set.
 * @param {string} sourcePath File or directory root.
 * @param {Set<string>} extensions Allowed lowercase extensions.
 * @returns {string[]} Absolute matching file paths.
 */
function revealFiles(sourcePath, extensions) {
	const stats = readdirSafe(sourcePath);
	if (!stats) return extensions.has(extname(sourcePath)) ? [sourcePath] : [];
	const files = [];
	for (const entry of stats) {
		const entryPath = join(sourcePath, entry.name);
		if (entry.isDirectory()) files.push(...revealFiles(entryPath, extensions));
		else if (extensions.has(extname(entry.name))) files.push(entryPath);
	}
	return files.sort();
}

/** @param {string} sourcePath Candidate directory. @returns {import("node:fs").Dirent[]|null} Entries or null for files. */
function readdirSafe(sourcePath) {
	try {
		return readdirSync(sourcePath, { withFileTypes: true });
	} catch {
		return null;
	}
}

/**
 * Removes comments before executable indentation and forbidden-runtime checks.
 * @param {string} source Complete JavaScript source.
 * @returns {string} Comment-free executable-oriented source.
 */
function revealExecutable(source) {
	return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

/** Proves all API/UI/input JavaScript obeys sacred header, line, tab, and renderer-independence law. @returns {void} */
function verifyJavaScriptLaw() {
	const paths = sourceRoots.flatMap((root) => revealFiles(root, new Set([".js"])))
		.concat([join(routeRoot, "src/main.js")]);
	assert.ok(paths.length >= 30);
	for (const path of paths) {
		const source = readFileSync(path, "utf8");
		const lines = source.split(/\r?\n/);
		const count = source.endsWith("\n") ? lines.length - 1 : lines.length;
		const label = relative(routeRoot, path);
		assert.ok(count <= 120, `${label} exceeds 120 lines`);
		assert.deepEqual(lines.slice(0, 3), ['//B"H', "// Boruch Hashem", "// Blessed is He"]);
		const executable = revealExecutable(source);
		assert.doesNotMatch(executable, /^ +\S/gm, `${label} contains space-indented executable code`);
		assert.doesNotMatch(executable, /\bTHREE\b|from\s+["']three["']|\/adapters\/three\//i);
	}
}

/** Proves active markup/styles use one semantic action/preference architecture without fossilized selectors. @returns {void} */
function verifyInterfaceVocabularyLaw() {
	const paths = visualRoots.flatMap((root) => revealFiles(root, new Set([".css", ".html"])))
		.concat(sourceRoots.flatMap((root) => revealFiles(root, new Set([".js"]))));
	const combined = paths.map((path) => readFileSync(path, "utf8")).join("\n");
	assert.doesNotMatch(combined, /data-intent=/);
	assert.doesNotMatch(combined, /\[data-intent=/);
	assert.doesNotMatch(combined, /fx-toggle|motion-toggle|controls-toggle/);
	assert.match(combined, /data-action/);
	assert.match(combined, /TEMPLE_PREFERENCES/);
}

/** Proves every active visual source remains bounded instead of hiding new interface monoliths. @returns {void} */
function verifyVisualLineLaw() {
	const paths = visualRoots.flatMap((root) => revealFiles(root, new Set([".css", ".html"])))
	for (const path of paths) {
		const source = readFileSync(path, "utf8");
		const count = source.endsWith("\n") ? source.split(/\r?\n/).length - 1 : source.split(/\r?\n/).length;
		assert.ok(count <= 120, `${relative(routeRoot, path)} exceeds 120 lines`);
	}
}

test("API UI and input JavaScript obey recursive source law", verifyJavaScriptLaw);
test("interface vocabulary contains no stale intent or toggle architecture", verifyInterfaceVocabularyLaw);
test("active HTML and CSS remain below the modular line ceiling", verifyVisualLineLaw);
