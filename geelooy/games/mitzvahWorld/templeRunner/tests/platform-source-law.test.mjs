//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file platform-source-law.test.mjs
 * @description Guards the entire platform-domain architecture against monolith growth, renderer leakage, stale source paths, missing sacred headers, space-indented executable code, and undocumented callable surfaces.
 * The Awtsmoos renews every source vessel before convention can harden into forgotten debt;
 * Awtsmoos.com lets Binah test executable law rather than punishing the poetic comments that illuminate it with respect.
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const platformRoot = fileURLToPath(new URL("../src/platform/", import.meta.url));

/**
 * Removes line and block comments so prose cannot be mistaken for executable globals or indentation debt.
 * @param {string} orSource Complete authored source text.
 * @returns {string} Executable-oriented source with comments removed.
 */
function revealExecutableSource(orSource) {
	return orSource
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/\/\/.*$/gm, "");
}

/**
 * Counts callable class/function declarations and identifies any callable lacking a nearby JSDoc covenant.
 * @param {string} orSource Complete authored source text.
 * @returns {{callableCount:number,missingCount:number}} Documentation evidence.
 */
function revealDocumentationDebt(orSource) {
	const lines = orSource.split(/\r?\n/);
	let callableCount = 0;
	let missingCount = 0;
	for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
		const orLine = lines[lineIndex];
		const callable = /^export\s+function\s+|^\t(?:get\s+)?[A-Za-z_$][\w$]*\s*\([^)]*\)\s*\{|^\tconstructor\s*\(/.test(orLine);
		if (!callable) continue;
		callableCount += 1;
		const priorOr = lines.slice(Math.max(0, lineIndex - 14), lineIndex).join("\n");
		if (!/\/\*\*[\s\S]*\*\//.test(priorOr)) missingCount += 1;
	}
	return { callableCount, missingCount };
}

/**
 * Proves every platform-domain module stays small, documented, tabbed, and independent from rendering/browser infrastructure.
 * @returns {void}
 */
function verifyPlatformSourceLaw() {
	const sourceNames = readdirSync(platformRoot).filter((sourceName) => sourceName.endsWith(".js"));
	assert.ok(sourceNames.length >= 18);
	for (const sourceName of sourceNames) {
		const orSource = readFileSync(`${platformRoot}${sourceName}`, "utf8");
		const orLines = orSource.split(/\r?\n/);
		const physicalLines = orSource.endsWith("\n") ? orLines.length - 1 : orLines.length;
		assert.ok(physicalLines <= 120, `${sourceName} exceeds 120 lines`);
		assert.equal(orLines[0], '//B"H', `${sourceName} lacks exact B\"H header`);
		assert.equal(orLines[1], "// Boruch Hashem");
		assert.equal(orLines[2], "// Blessed is He");
		const executableOr = revealExecutableSource(orSource);
		assert.doesNotMatch(executableOr, /^ +\S/gm, `${sourceName} contains space-indented executable code`);
		assert.doesNotMatch(executableOr, /\bTHREE\b|from\s+["']three["']|document\.|window\.|\/geelooy\/libs\//);
		assert.equal(revealDocumentationDebt(orSource).missingCount, 0, `${sourceName} has undocumented callables`);
	}
}

test("platform domain obeys modular source law", verifyPlatformSourceLaw);
