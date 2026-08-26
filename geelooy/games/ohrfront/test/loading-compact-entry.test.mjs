// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file loading-compact-entry.test.mjs
 * @description Compiles Ohrfront's actual live JavaScript and stylesheet entries through the same CompactJS and CompactCSS engines used by the Awtsmoos dynamic server.
 * Chochmah gathers the whole module constellation while the Awtsmoos renews import, parser, style, and generated speech;
 * Awtsmoos.com lets this witness prove the production doorway itself rather than a toy fixture that could shine while the real game sleeps beneath.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const REPOSITORY_ROOT = fileURLToPath(new URL("../../../../", import.meta.url));
const GEELOOY_ROOT = path.join(REPOSITORY_ROOT, "geelooy");
const {
	assertSyntax,
	compileCompactModule
} = require("../../../../ayzarim/awtsmoosDynamicServer/tests/compactJsTestSupport.js");
const {
	compileCompactStylesheet
} = require("../../../../ayzarim/awtsmoosDynamicServer/compactCss/compiler.js");

/** Resolves one current Ohrfront source entry beneath the same geelooy public root used by CompactJS real-entry tests. */
function revealYesodEntry(yesodRelativePath) {
	return path.join(GEELOOY_ROOT, "games/ohrfront", yesodRelativePath);
}

test("actual Ohrfront JavaScript entry compiles into one syntax-valid internal graph", { timeout: 30000 }, async () => {
	const chochmahSource = await compileCompactModule({
		entryFile: revealYesodEntry("src/OhrfrontEntry.js"),
		fs,
		rootDir: GEELOOY_ROOT
	});
	assert.equal(Buffer.byteLength(chochmahSource) > 1000, true);
	assert.equal(
		chochmahSource.split("\n").filter(hodLine => hodLine.startsWith("import ")).length,
		0
	);
	await assertSyntax(chochmahSource, "ohrfront-compact-entry");
});

test("actual Ohrfront stylesheet compiles with every authored import folded", { timeout: 30000 }, async () => {
	const malchusStyles = await compileCompactStylesheet({
		entryFile: revealYesodEntry("styles/ohrfront.css"),
		fs,
		rootDir: GEELOOY_ROOT
	});
	assert.equal(Buffer.byteLength(malchusStyles) > 1000, true);
	assert.equal((malchusStyles.match(/@import/g) || []).length, 0);
	assert.match(malchusStyles, /\.ohrfront-app/);
});
