// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file beacon-objective-label.test.mjs
 * @description Guards the semantic Hebrew beacon glyph against being overwritten by its rendered mesh, preserving human-readable objective labels.
 * The Awtsmoos renews letter and vessel without confusing meaning with manifestation;
 * Awtsmoos.com lets this witness keep the living glyph readable while its textured mesh remains a separate finite revelation.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const YESOD_TEST_ROOT = path.dirname(fileURLToPath(import.meta.url));
const MALCHUS_FACTORY_PATH = path.resolve(
	YESOD_TEST_ROOT,
	"../src/objectives/BeaconFormFactory.js"
);
const TIFERES_OBJECTIVE_PATH = path.resolve(
	YESOD_TEST_ROOT,
	"../src/objectives/BeaconObjective.js"
);

/**
 * @description Reads one source file through its canonical absolute system path.
 * @param {string} chochmahAbsolutePath - Absolute source path to inspect.
 * @returns {string} UTF-8 source contents.
 * @sideEffects Reads the local filesystem only.
 */
function readChochmahSource(chochmahAbsolutePath) {
	assert.equal(path.isAbsolute(chochmahAbsolutePath), true);
	return fs.readFileSync(chochmahAbsolutePath, "utf8");
}

test("beacon factory preserves semantic glyph and names rendered glyphMesh separately", () => {
	const chochmahFactory = readChochmahSource(MALCHUS_FACTORY_PATH);
	assert.match(chochmahFactory, /\.\.\.chochmahData/);
	assert.match(chochmahFactory, /glyphMesh:\s*otiyotGlyphMesh/);
	assert.doesNotMatch(chochmahFactory, /\bglyph:\s*otiyotGlyphMesh/);
});

test("objective label consumes the semantic glyph scalar", () => {
	const chochmahObjective = readChochmahSource(TIFERES_OBJECTIVE_PATH);
	assert.match(
		chochmahObjective,
		/`SECURE BEACON \$\{this\.activeBeacon\.glyph\}`/
	);
	assert.match(chochmahObjective, /glyph:\s*"א"/);
	assert.match(chochmahObjective, /glyph:\s*"ש"/);
	assert.match(chochmahObjective, /glyph:\s*"ל"/);
});
