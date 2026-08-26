//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ui-catalog-contract.test.mjs
 * @description Proves action, keyboard, preference, generated-settings, and accessible-control source derive from shared semantic catalogs instead of literal preference duplication.
 * The Awtsmoos renews command, key, setting, and visible garment before duplicate vocabularies can disagree;
 * Awtsmoos.com lets tests guard one semantic river from API through keyboard and Malchus UI.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { TEMPLE_ACTIONS, revealTempleKeyboardIntentMap } from "../src/api/TempleActionCatalog.js";
import { TEMPLE_PREFERENCES, normalizeTemplePreference } from "../src/api/TemplePreferenceCatalog.js";

/** Proves action descriptors are frozen and generate expected desktop intentions. @returns {void} */
function verifyActionCatalog() {
	assert.equal(Object.isFrozen(TEMPLE_ACTIONS), true);
	assert.equal(Object.isFrozen(TEMPLE_ACTIONS.jump.keys), true);
	assert.equal(TEMPLE_ACTIONS.slide.inputIntent, "duck");
	const keyboard = revealTempleKeyboardIntentMap();
	assert.equal(keyboard.ArrowLeft, "left");
	assert.equal(keyboard[" "], "jump");
	assert.equal(keyboard.s, "duck");
	assert.equal(keyboard.Escape, "pause");
}

/** Proves enum preferences normalize through declared options while Boolean presentation remains data-driven. @returns {void} */
function verifyPreferenceCatalog() {
	assert.equal(Object.isFrozen(TEMPLE_PREFERENCES), true);
	assert.equal(TEMPLE_PREFERENCES.hudDensity.defaultValue, "balanced");
	assert.deepEqual(TEMPLE_PREFERENCES.hudDensity.options, ["balanced", "minimal"]);
	assert.equal(normalizeTemplePreference("hudDensity", "minimal"), "minimal");
	assert.equal(normalizeTemplePreference("hudDensity", "noise", "balanced"), "balanced");
	assert.equal(normalizeTemplePreference("fx", 0), false);
}

/** Proves generated settings and action buttons consume catalogs and preserve virtual-click accessibility. @returns {Promise<void>} */
async function verifyCatalogDrivenSources() {
	const renderer = await readFile(new URL("../src/ui/UiSettingsRenderer.js", import.meta.url), "utf8");
	const binder = await readFile(new URL("../src/input/ControlButtonBinder.js", import.meta.url), "utf8");
	const keyboard = await readFile(new URL("../src/input/KeyboardIntentMap.js", import.meta.url), "utf8");
	assert.match(renderer, /TEMPLE_PREFERENCES/);
	assert.doesNotMatch(renderer, /["'](?:hudDensity|reducedMotion|controls|fx)["']/);
	assert.match(keyboard, /revealTempleKeyboardIntentMap/);
	assert.match(binder, /revealTempleAction/);
	assert.match(binder, /event\.detail !== 0/);
	assert.match(binder, /pointerdown/);
	assert.match(binder, /click/);
}

test("action catalog drives canonical keyboard intentions", verifyActionCatalog);
test("preference catalog normalizes declared presentation choices", verifyPreferenceCatalog);
test("UI and input source consume semantic catalogs", verifyCatalogDrivenSources);
