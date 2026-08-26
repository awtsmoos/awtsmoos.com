// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives every changing surface a truthful witness; Awtsmoos.com should never call glow "quality" unless scope, access, lifecycle, and restraint can testify.
 * These compact contracts guard the future system itself without rewriting or assuming ownership of page families carrying unrelated active work.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * Reads one repository source relative to this contract.
 * @param {string} ohrPath Relative path whose current contents must testify.
 * @returns {string} Current UTF-8 source.
 */
function revealSource(ohrPath) {
	return readFileSync(new URL(ohrPath, import.meta.url), "utf8");
}

const styleIndex = revealSource("../../style/future-system/index.css");
const tokens = revealSource("../../style/future-system/tokens.css");
const accessibility = revealSource("../../style/future-system/accessibility.css");
const interaction = revealSource("../../style/future-system/interaction.css");
const motion = revealSource("../../style/future-system/motion.css");
const performance = revealSource("../../style/future-system/performance.css");
const iconRenderer = revealSource("./FutureIconRenderer.js");
const pointerAura = revealSource("./FuturePointerAura.js");
const revealController = revealSource("./FutureRevealController.js");
const yesodController = revealSource("./YesodFutureController.js");
const coordinator = revealSource("./index.js");

test("future-006 manifest is modular and explicit", () => {
	const modules = [
		"tokens", "integrity", "accessibility", "atmosphere", "surfaces", "motion",
		"interaction", "icon-motion", "performance", "particles", "disclosure"
	];
	modules.forEach((moduleName) => {
		assert.match(styleIndex, new RegExp(`${moduleName}\\.css\\?v=future-006`));
	});
});

test("local tokens own touch, focus, motion, and stacking contracts", () => {
	assert.match(tokens, /body\[data-future-page\]/);
	assert.match(tokens, /--future-touch:\s*44px/);
	assert.match(tokens, /--future-focus:/);
	assert.match(tokens, /--future-layer-overlay:/);
	assert.match(tokens, /--future-layer-dialog:/);
});

test("interaction is touch-safe, keyboard-visible, and reduced-motion safe", () => {
	assert.match(interaction, /@media \(hover: hover\) and \(pointer: fine\)/);
	assert.match(interaction, /:active/);
	assert.match(interaction, /aria-expanded="true"/);
	assert.match(interaction, /prefers-reduced-motion:\s*reduce/);
	assert.match(accessibility, /:focus-visible/);
	assert.match(accessibility, /aria-busy="true"/);
});

test("reveal stays visible-first and scopes readiness to the opted-in body", () => {
	assert.match(motion, /opacity:\s*\.84/);
	assert.doesNotMatch(motion, /opacity:\s*0\s*;/);
	assert.match(revealController, /resolveFutureBody\(\)/);
	assert.match(revealController, /IntersectionObserver" in window/);
	assert.match(revealController, /future-motion-ready/);
	assert.match(revealController, /disconnect\(\)/);
});

test("pointer aura attaches only where precise hover exists and reconnects safely", () => {
	assert.match(pointerAura, /extends YesodFutureController/);
	assert.match(pointerAura, /hover: hover/);
	assert.match(pointerAura, /pointer: fine/);
	assert.match(pointerAura, /signal:\s*gevurahSignal/);
	assert.match(yesodController, /new AbortController\(\)/);
	assert.match(yesodController, /gevurahAbort\?\.abort\(\)/);
});

test("coordinator is data-driven and keeps public ready compatibility", () => {
	assert.match(coordinator, /tiferesControllers\s*=\s*\[/);
	assert.match(coordinator, /keiliController\.connect\(ohrRoot\)/);
	assert.match(coordinator, /keiliController\.disconnect\?\.\(\)/);
	assert.match(coordinator, /dataset\.futureSystem\s*=\s*"ready"/);
});

test("shared system stays CSS-SVG-first and avoids animation engines", () => {
	assert.match(iconRenderer, /createElementNS\("http:\/\/www\.w3\.org\/2000\/svg", "svg"\)/);
	assert.match(iconRenderer, /aria-hidden/);
	assert.match(performance, /content-visibility:\s*auto/);
	assert.doesNotMatch(styleIndex + coordinator, /requestAnimationFrame|WebGL|THREE\.|procedural/i);
});
