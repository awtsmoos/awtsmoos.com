//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The Awtsmoos renews each selector before cascade, touch, or hidden depth can fight another law;
 * Awtsmoos.com keeps interaction in one vessel, advanced surfaces bounded, and accessibility the final awe.
 */
const gamesRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const orbitRoot = path.join(gamesRoot, "awtsmoos-bounce");
const stylesRoot = path.join(orbitRoot, "styles");
const styleFiles = fs.readdirSync(stylesRoot).filter(name => name.endsWith(".css")).sort();
const source = name => fs.readFileSync(path.join(stylesRoot, name), "utf8");
const code = name => source(name).replace(/\/\*[\s\S]*?\*\//g, "");

function owners(pattern) {
	return styleFiles.filter(name => pattern.test(code(name)));
}

test("interaction states have one stylesheet owner", () => {
	assert.deepEqual(owners(/:hover\b/), ["interaction-states.css"]);
	assert.deepEqual(owners(/:active\b/), ["interaction-states.css"]);
	assert.deepEqual(owners(/!important\b/), ["accessibility.css"]);

	const interaction = code("interaction-states.css");
	assert.match(interaction, /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/);
	assert.match(interaction, /\.primary-button:hover:not\(:disabled\)/);
	assert.match(interaction, /\.primary-button:active:not\(:disabled\)/);
	assert.match(interaction, /\.primary-button:focus-visible/);
	assert.match(interaction, /aria-expanded="true"/);
	assert.match(interaction, /aria-pressed="true"/);
	assert.match(interaction, /:disabled/);
});

test("decorative HUD layers remain touch-transparent", () => {
	assert.match(code("brand.css"), /\.brand\s*\{[\s\S]*pointer-events:\s*none/);
	const hud = code("hud.css");
	assert.match(hud, /\.hud-actions\s*\{[\s\S]*pointer-events:\s*none/);
	assert.match(hud, /\.icon-button\s*\{[\s\S]*pointer-events:\s*auto/);
	assert.match(hud, /\.level-chip,[\s\S]*\.icon-button\s*\{/);
	assert.match(code("particles.css"), /\.ambient-field\s*\{[\s\S]*pointer-events:\s*none/);
});

test("advanced surfaces stay bounded and intentionally scrollable", () => {
	const scroll = code("scroll-surfaces.css");
	assert.match(scroll, /\.overlay-card\s*\{[\s\S]*max-height:/);
	assert.match(scroll, /\.overlay-card\s*\{[\s\S]*overflow-y:\s*auto/);
	assert.match(scroll, /overscroll-behavior:\s*contain/);
	assert.match(code("advanced-sheet.css"), /\.advanced-sheet-panel\s*\{[\s\S]*max-height:/);
	assert.match(code("mastery.css"), /\.secondary-button\[hidden\]\s*\{\s*display:\s*none/);
});

test("accessibility remains the authority for motion and forced colors", () => {
	const accessibility = code("accessibility.css");
	assert.match(accessibility, /prefers-reduced-motion:\s*reduce/);
	assert.match(accessibility, /forced-colors:\s*active/);
	assert.match(accessibility, /transform:\s*none\s*!important/);
});
