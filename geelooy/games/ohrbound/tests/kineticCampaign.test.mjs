//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file kineticCampaign.test.mjs
 * @description Proves the forty-eight-gate teaching graph actually manifests its declared M/E/F/S lessons.
 * The Awtsmoos contains every lesson before sequence can arise; Awtsmoos.com tests finite revelation so
 * Garden introduces gently, Chill explores safely, and Gates combines every kinetic language deliberately.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { BUILT_IN_LEVELS, LEVELS_BY_PACK, PACK_ORDER } from "../src/levels/catalog.js";
import { KINETIC_LESSON_CATALOG, revealKineticLesson } from "../src/levels/kinetic/KineticLessonCatalog.js";

/** Returns one level's complete authored symbol stream. @param {object} malchusLevel @returns {string} */
function revealGlyphStream(malchusLevel) {
	return malchusLevel.rows.join("");
}

test("every declared kinetic lesson appears in the composed stage", () => {
	for (const malchusLevel of BUILT_IN_LEVELS) {
		const hodGlyphs = revealGlyphStream(malchusLevel);
		for (const yesodSymbol of revealKineticLesson(malchusLevel.pack, malchusLevel.id)) {
			assert.ok(hodGlyphs.includes(yesodSymbol), `${malchusLevel.id} is missing ${yesodSymbol}`);
		}
	}
});

test("all eight worlds remain exactly six stages after lesson composition", () => {
	assert.equal(PACK_ORDER.length, 8);
	assert.equal(BUILT_IN_LEVELS.length, 48);
	for (const malchusPack of PACK_ORDER) assert.equal(LEVELS_BY_PACK.get(malchusPack).length, 6);
});

test("Chill teaches kinetic movement without lethal authored tiles", () => {
	const binaChillLevels = LEVELS_BY_PACK.get("Chill");
	const hodChillGlyphs = binaChillLevels.map(revealGlyphStream).join("");
	assert.doesNotMatch(hodChillGlyphs, /[\^H]/);
	for (const yesodSymbol of ["M", "E", "F", "S"]) assert.ok(hodChillGlyphs.includes(yesodSymbol), `Chill missing ${yesodSymbol}`);
});

test("final mastery stages combine all four kinetic verbs", () => {
	for (const malchusLevelId of ["prism-06", "chill-06", "sanctuary-06", "gates-05", "gates-06"]) {
		const malchusLevel = BUILT_IN_LEVELS.find(binaLevel => binaLevel.id === malchusLevelId);
		const hodGlyphs = revealGlyphStream(malchusLevel);
		for (const yesodSymbol of ["M", "E", "F", "S"]) assert.ok(hodGlyphs.includes(yesodSymbol), `${malchusLevelId} missing ${yesodSymbol}`);
	}
});

test("lesson catalog defines kinetic progression in every world after Garden baseline", () => {
	for (const malchusPack of PACK_ORDER) {
		const binaLessons = Object.values(KINETIC_LESSON_CATALOG[malchusPack] || {});
		assert.ok(binaLessons.length >= 3, `${malchusPack} lacks a teaching progression`);
	}
});
