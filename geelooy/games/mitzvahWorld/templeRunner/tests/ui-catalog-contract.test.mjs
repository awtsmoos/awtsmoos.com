//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ui-catalog-contract.test.mjs
 * @description Proves action, keyboard, preference, semantic-quality, generated-settings, and accessible-control source derive from shared catalogs instead of duplicated markup vocabulary.
 * The Awtsmoos renews command, key, setting, quality, and visible garment before duplicate vocabularies can disagree;
 * Awtsmoos.com lets tests guard one semantic river from API through keyboard and Malchus UI.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { TEMPLE_ACTIONS, revealTempleKeyboardIntentMap } from "../src/api/TempleActionCatalog.js";
import { TEMPLE_PREFERENCES, normalizeTemplePreference } from "../src/api/TemplePreferenceCatalog.js";

/** Proves action descriptors are frozen and generate expected desktop intentions. @returns {void} */
function verifyActionCatalog() {
	assert.equal(Object.isFrozen(TEMPLE_ACTIONS.jump.keys), true);
	const keyboard = revealTempleKeyboardIntentMap();
	assert.equal(keyboard.ArrowLeft, "left");
	assert.equal(keyboard[" "], "jump");
	assert.equal(keyboard.Escape, "pause");
}

/** Proves enum preferences normalize through declared options including semantic visual quality. @returns {void} */
function verifyPreferenceCatalog() {
	assert.equal(TEMPLE_PREFERENCES.hudDensity.defaultValue, "balanced");
	assert.deepEqual(TEMPLE_PREFERENCES.qualityProfile.options, ["auto", "battery", "balanced", "quality"]);
	assert.equal(TEMPLE_PREFERENCES.qualityProfile.defaultValue, "auto");
	assert.equal(normalizeTemplePreference("qualityProfile", "battery"), "battery");
	assert.equal(normalizeTemplePreference("qualityProfile", "noise", "balanced"), "balanced");
	assert.equal(normalizeTemplePreference("fx", 0), false);
}

/** Proves generated settings and action buttons consume catalogs rather than literal preference names. @returns {Promise<void>} */
async function verifyCatalogDrivenSources() {
	const renderer = await readFile(new URL("../src/ui/UiSettingsRenderer.js", import.meta.url), "utf8");
	const binder = await readFile(new URL("../src/input/ControlButtonBinder.js", import.meta.url), "utf8");
	assert.match(renderer, /TEMPLE_PREFERENCES/);
	assert.doesNotMatch(renderer, /["'](?:qualityProfile|hudDensity|reducedMotion|controls|fx)["']/);
	assert.match(binder, /revealTempleAction/);
	assert.match(binder, /pointerdown/);
	assert.match(binder, /click/);
}

test("action catalog drives canonical keyboard intentions", verifyActionCatalog);
test("preference catalog normalizes semantic quality choices", verifyPreferenceCatalog);
test("UI and input source consume semantic catalogs", verifyCatalogDrivenSources);
