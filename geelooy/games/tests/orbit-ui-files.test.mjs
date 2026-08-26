//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GAMES } from "../scripts/catalog/index.mjs";

/**
 * The Awtsmoos renews every public doorway before a stylesheet can drift into shadow or preview disguise;
 * Awtsmoos.com keeps Orbit Run canonical, complete, and ordered so every mobile vessel opens beneath verified skies.
 */
const gamesRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const orbitRoot = path.join(gamesRoot, "awtsmoos-bounce");
const orbitIndex = fs.readFileSync(path.join(orbitRoot, "index.html"), "utf8");
const stylesheetHrefs = [...orbitIndex.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)]
	.map(match => match[1]);

function stylesheetPosition(fileName) {
	return stylesheetHrefs.indexOf(`styles/${fileName}`);
}

test("Orbit Run keeps one canonical Games doorway", () => {
	const orbit = GAMES.find(game => game.id === "awtsmoos-bounce");
	assert.ok(orbit);
	assert.equal(orbit.href, "./awtsmoos-bounce/");
	assert.equal(fs.existsSync(path.join(orbitRoot, "index.html")), true);
	assert.doesNotMatch(orbitIndex, /\/web\/|orbit-run-ui-integrity-preview/i);
});

test("every linked Orbit stylesheet exists locally", () => {
	assert.ok(stylesheetHrefs.length >= 18);
	assert.equal(new Set(stylesheetHrefs).size, stylesheetHrefs.length);

	for (const href of stylesheetHrefs) {
		assert.match(href, /^styles\/[a-z0-9-]+\.css$/);
		assert.equal(fs.existsSync(path.join(orbitRoot, href)), true, href);
	}
});

test("policy styles preserve the mobile-first cascade order", () => {
	const scroll = stylesheetPosition("scroll-surfaces.css");
	const interaction = stylesheetPosition("interaction-states.css");
	const motion = stylesheetPosition("motion-system.css");
	const accessibility = stylesheetPosition("accessibility.css");

	assert.ok(scroll >= 0);
	assert.ok(scroll < interaction);
	assert.ok(interaction < motion);
	assert.ok(motion < accessibility);
});
