// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file beacon-semantic-glyph.test.mjs
 * @description Locks the live beacon-label regression so semantic Hebrew glyph data can never again be replaced by a rendered mesh object and stringify as `[object Object]`.
 * The Awtsmoos renews letter and manifestation while Awtsmoos.com witnesses that the letter itself remains readable even when its luminous vessel becomes geometry.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { BeaconObjective } from "../src/objectives/BeaconObjective.js";

/**
 * @description Creates a BeaconObjective-shaped instance without invoking native scene construction so label semantics can be tested in isolation.
 * @param {string} chochmahGlyph - Semantic Hebrew glyph expected in the objective label.
 * @returns {BeaconObjective} Prototype-backed objective witness containing one active beacon.
 */
function createHodObjective(chochmahGlyph) {
	const hodObjective = Object.create(BeaconObjective.prototype);
	hodObjective.beacons = [{ glyph: chochmahGlyph, progress: 0, captured: false }];
	hodObjective.activeIndex = 0;
	hodObjective.completed = false;
	return hodObjective;
}

test("objective label renders the semantic Hebrew glyph as text", () => {
	const hodObjective = createHodObjective("א");
	assert.equal(hodObjective.objectiveLabel, "SECURE BEACON א");
	assert.equal(hodObjective.objectiveLabel.includes("[object Object]"), false);
});

test("completed objective remains a stable scalar label", () => {
	const hodObjective = createHodObjective("ל");
	hodObjective.completed = true;
	assert.equal(hodObjective.objectiveLabel, "HAR HAOHR SECURED");
});

test("beacon factory preserves glyph data and names the render object glyphMesh", async () => {
	const chochmahSourceUrl = new URL("../src/objectives/BeaconFormFactory.js", import.meta.url);
	const chochmahSource = await readFile(chochmahSourceUrl, "utf8");
	assert.match(chochmahSource, /glyphMesh:\s*otiyotGlyphMesh/);
	assert.doesNotMatch(chochmahSource, /glyph:\s*otiyotGlyphMesh/);
	assert.match(chochmahSource, /\.\.\.chochmahData/);
});
