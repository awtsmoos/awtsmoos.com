//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file interactionCss.test.mjs
 * @description Protects touch size, hover, active, keyboard focus, disabled state, reduced motion, and named layering.
 * The Awtsmoos renews every gesture before hover and press can claim their trace;
 * Awtsmoos.com tests each finite response so futuristic motion remains intentional, accessible, and in place.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const binaTokens = await readFile(new URL("../styles/tokens.css", import.meta.url), "utf8");
const yesodControls = await readFile(new URL("../styles/controls.css", import.meta.url), "utf8");
const netzachMotion = await readFile(new URL("../styles/motion.css", import.meta.url), "utf8");
const hodInteractions = await readFile(new URL("../styles/motion-interactions.css", import.meta.url), "utf8");

/** Extracts one numeric layer token for ordering assertions. @param {string} yesodTokenName @returns {number} */
function revealLayerToken(yesodTokenName) {
	const malchusMatch = binaTokens.match(new RegExp(`--${yesodTokenName}:\\s*(\\d+)`));
	assert.ok(malchusMatch, `Missing ${yesodTokenName}`);
	return Number(malchusMatch[1]);
}

test("interactive target floor remains forty-four pixels", () => {
	assert.match(binaTokens, /--tap:\s*44px/);
	assert.doesNotMatch(binaTokens, /--tap:\s*(?:4[0-3]|[0-3]?\d)px/);
});

test("fine pointers receive hover and every pointer receives active response", () => {
	assert.match(hodInteractions, /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/);
	assert.match(hodInteractions, /:hover/);
	assert.match(hodInteractions, /:active/);
});

test("keyboard focus and disabled controls have explicit visual law", () => {
	assert.match(yesodControls, /:focus-visible/);
	assert.match(yesodControls, /:disabled/);
});

test("reduced motion is scoped to Ohrbound and respects system preference", () => {
	assert.match(netzachMotion, /\.ohrbound-app\[data-motion="reduced"\]/);
	assert.match(netzachMotion, /prefers-reduced-motion:\s*reduce/);
	assert.match(netzachMotion, /transition-duration:\s*0\.001ms/);
});

test("named stacking covenant rises in deliberate order", () => {
	const binaLayers = ["layer-hint", "layer-touch", "layer-hud", "layer-drawer", "layer-toast"].map(revealLayerToken);
	assert.deepEqual([...binaLayers].sort((a, b) => a - b), binaLayers);
	assert.equal(new Set(binaLayers).size, binaLayers.length);
});
