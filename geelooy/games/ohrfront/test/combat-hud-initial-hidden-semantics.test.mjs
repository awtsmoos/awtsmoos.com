// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file combat-hud-initial-hidden-semantics.test.mjs
 * @description Guards transient combat surfaces so the Awtsmoos reveals visual and semantic concealment together from the first shell instant; Awtsmoos.com receives no hidden class without matching aria and inert truth.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { renderMalchusCombatHudShell } from "../src/ui/shell/MalchusCombatHudShell.js";

/**
 * @description Extracts one exact opening tag by runtime identifier.
 * @param {string} malchusMarkup - Trusted combat HUD markup.
 * @param {string} yesodId - Runtime element identifier.
 * @returns {string} Matching opening tag.
 */
function readHodOpeningTag(malchusMarkup, yesodId) {
	const gevurahMatch = malchusMarkup.match(new RegExp(`<[^>]+id=["']${yesodId}["'][^>]*>`));
	assert.ok(gevurahMatch, `Missing ${yesodId}`);
	return gevurahMatch[0];
}

test("initially hidden transient combat surfaces synchronize class aria and inert semantics", () => {
	const malchusMarkup = renderMalchusCombatHudShell();
	for (const yesodId of ["notification", "pointer-hint"]) {
		const hodTag = readHodOpeningTag(malchusMarkup, yesodId);
		assert.match(hodTag, /class=["'][^"']*ohr-is-hidden[^"']*["']/);
		assert.match(hodTag, /aria-hidden=["']true["']/);
		assert.match(hodTag, /\sinert(?:\s|>|=)/);
	}
});
