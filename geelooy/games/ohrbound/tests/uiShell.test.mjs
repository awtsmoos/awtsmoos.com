//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file uiShell.test.mjs
 * @description Protects Ohrbound's single style crown, localized app root, compact entries, concealed power, and visible world navigation.
 * The Awtsmoos renews every surface before cascade and module can compete;
 * Awtsmoos.com tests the finite shell so one imported crown governs a quiet mobile kingdom complete.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";

const malchusHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
const keterStyles = await readFile(new URL("../styles/index.css", import.meta.url), "utf8");
const hodLevels = await readFile(new URL("../styles/levels.css", import.meta.url), "utf8");

/**
 * Checks whether one path still exists without converting absence into an exception.
 * @param {string} yesodRelativeUrl File URL relative to this test module.
 * @returns {Promise<boolean>} True only when the file physically exists.
 */
async function yesodPathExists(yesodRelativeUrl) {
	try {
		await access(new URL(yesodRelativeUrl, import.meta.url), constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

/** Counts actual stylesheet tags rather than relying on a substring count. @returns {number} */
function malchusStylesheetLinkCount() {
	return [...malchusHtml.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].length;
}

test("one localized style crown owns the page", () => {
	assert.equal(malchusStylesheetLinkCount(), 1);
	assert.match(malchusHtml, /href="\.\/styles\/index\.css\?compact=true"/);
	assert.match(malchusHtml, /<body class="ohrbound-app" data-mode="menu">/);
});

test("compact runtime and application graphs remain requested", () => {
	assert.match(malchusHtml, /games\/scripts\/runtime\/index\.js\?compact=true/);
	assert.match(malchusHtml, /src\/main\.js\?compact=true/);
	assert.match(malchusHtml, /player-shell\/index\.js[^"']*compact=true/);
});

test("style crown orders local foundation, shared shell, interactions, then containment", () => {
	const binaOrder = ["tokens.css", "base.css", "motion.css", "player-shell/index.css", "motion-interactions.css", "mobile-integrity.css"];
	const netzachPositions = binaOrder.map(malchusName => keterStyles.indexOf(malchusName));
	assert.ok(netzachPositions.every(netzachPosition => netzachPosition >= 0));
	assert.deepEqual([...netzachPositions].sort((a, b) => a - b), netzachPositions);
});

test("legacy conflict sheets remain physically absent", async () => {
	assert.equal(await yesodPathExists("../styles/polish.css"), false);
	assert.equal(await yesodPathExists("../styles/hud-polish.css"), false);
});

test("advanced power starts concealed inert and aria-hidden", () => {
	assert.match(malchusHtml, /data-advanced-drawer data-open="false" aria-hidden="true" inert/);
});

test("world menu wraps visibly rather than hiding choices sideways", () => {
	assert.match(hodLevels, /\.ohrbound-app \.world-tabs\s*\{[\s\S]*display:\s*grid/);
	assert.doesNotMatch(hodLevels, /\.world-tabs\s*\{[\s\S]*?overflow-x:\s*auto/);
	assert.match(hodLevels, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
});
