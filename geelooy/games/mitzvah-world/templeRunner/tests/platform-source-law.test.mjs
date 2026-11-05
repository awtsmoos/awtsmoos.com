//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file platform-source-law.test.mjs
 * @description Recursively guards every platform-domain source module against monolith growth, renderer leakage, stale imports, missing sacred headers, space-indented executable code, and undocumented callable surfaces.
 * The Awtsmoos renews every folder beneath every folder before hidden depth can become hidden debt;
 * Awtsmoos.com lets Binah recurse through the whole platform tree so new worlds inherit clarity and architectural respect.
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const platformRoot = fileURLToPath(new URL("../src/platform/", import.meta.url));

/**
 * Recursively reveals every JavaScript source file beneath the platform root in deterministic sorted order.
 * @param {string} directoryPath Current directory being excavated.
 * @returns {string[]} Absolute JavaScript source paths.
 */
function revealPlatformSources(directoryPath) {
	const sourcePaths = [];
	for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
		const entryPath = join(directoryPath, entry.name);
		if (entry.isDirectory()) {
			sourcePaths.push(...revealPlatformSources(entryPath));
		} else if (entry.name.endsWith(".js")) {
			sourcePaths.push(entryPath);
		}
	}
	return sourcePaths.sort();
}

/**
 * Removes line and block comments so poetic prose cannot be mistaken for executable globals or indentation debt.
 * @param {string} orSource Complete authored source text.
 * @returns {string} Executable-oriented source with comments removed.
 */
function revealExecutableSource(orSource) {
	return orSource
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/\/\/.*$/gm, "");
}

/**
 * Counts callable class/function declarations that lack a nearby JSDoc covenant.
 * @param {string} orSource Complete authored source text.
 * @returns {number} Number of undocumented callable declarations.
 */
function revealDocumentationDebt(orSource) {
	const orLines = orSource.split(/\r?\n/);
	let missingCount = 0;
	for (let lineIndex = 0; lineIndex < orLines.length; lineIndex += 1) {
		const callable = /^export\s+function\s+|^\t(?:get\s+)?[A-Za-z_$][\w$]*\s*\([^)]*\)\s*\{|^\tconstructor\s*\(/.test(orLines[lineIndex]);
		if (!callable) continue;
		const priorOr = orLines.slice(Math.max(0, lineIndex - 16), lineIndex).join("\n");
		if (!/\/\*\*[\s\S]*\*\//.test(priorOr)) missingCount += 1;
	}
	return missingCount;
}

/**
 * Proves all current and future nested platform modules obey the same modular source laws.
 * @returns {void}
 */
function verifyRecursivePlatformSourceLaw() {
	const sourcePaths = revealPlatformSources(platformRoot);
	assert.ok(sourcePaths.length >= 32, "expected nested portable modules in recursive source scan");
	for (const sourcePath of sourcePaths) {
		const orSource = readFileSync(sourcePath, "utf8");
		const orLines = orSource.split(/\r?\n/);
		const physicalLines = orSource.endsWith("\n") ? orLines.length - 1 : orLines.length;
		assert.ok(physicalLines <= 120, `${sourcePath} exceeds 120 lines`);
		assert.equal(orLines[0], '//B"H', `${sourcePath} lacks exact B\"H header`);
		assert.equal(orLines[1], "// Boruch Hashem");
		assert.equal(orLines[2], "// Blessed is He");
		const executableOr = revealExecutableSource(orSource);
		assert.doesNotMatch(executableOr, /^ +\S/gm, `${sourcePath} contains space-indented executable code`);
		assert.doesNotMatch(executableOr, /\bTHREE\b|from\s+["']three["']|document\.|window\.|\/geelooy\/libs\//);
		assert.equal(revealDocumentationDebt(orSource), 0, `${sourcePath} has undocumented callables`);
	}
}

test("recursive platform domain obeys modular source law", verifyRecursivePlatformSourceLaw);
