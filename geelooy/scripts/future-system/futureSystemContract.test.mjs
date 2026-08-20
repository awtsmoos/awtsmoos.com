// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos unifies many Awtsmoos.com routes without flattening their identities into one costume.
 * These contracts guard the shared future language: real SVG signs, visible-first motion, and explicit page adoption.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * Reads one project vessel relative to this contract file.
 * @param {string} ohrPath Relative source path.
 * @returns {string} Revealed source text.
 */
function revealSource(ohrPath) {
	return readFileSync(new URL(ohrPath, import.meta.url), "utf8");
}

const styleIndex = revealSource("../../style/future-system/index.css");
const surfaces = revealSource("../../style/future-system/surfaces.css");
const motion = revealSource("../../style/future-system/motion.css");
const iconRenderer = revealSource("./FutureIconRenderer.js");
const pointerAura = revealSource("./FuturePointerAura.js");
const coordinator = revealSource("./index.js");
const games = revealSource("../../games/index.html");
const apps = revealSource("../../apps/index.html");
const wallet = revealSource("../../apps/wallet/index.html");
const about = revealSource("../../about/index.html");
const socialStyle = revealSource("../../social-hub/style.css");
const os = revealSource("../../os/index.html");
const torah = revealSource("../../mawgawl/sefarim/index.html");

test("future style manifest stays modular", () => {
	for (const moduleName of ["tokens.css", "atmosphere.css", "surfaces.css", "motion.css"]) {
		assert.match(styleIndex, new RegExp(moduleName.replace(".", "\\.")));
	}
});

test("motion is visible-first and reduced-motion safe", () => {
	assert.match(motion, /\[data-future-reveal\][\s\S]*opacity:\s*\.84/);
	assert.doesNotMatch(motion, /\[data-future-reveal\][\s\S]{0,180}opacity:\s*0\s*;/);
	assert.match(motion, /prefers-reduced-motion:\s*reduce/);
	assert.doesNotMatch(motion, /social-hub-document \.heroRift::/);
});

test("semantic icons render as accessible inline svg", () => {
	assert.match(iconRenderer, /createElementNS\("http:\/\/www\.w3\.org\/2000\/svg", "svg"\)/);
	assert.match(iconRenderer, /createElementNS\("http:\/\/www\.w3\.org\/2000\/svg", "path"\)/);
	assert.match(iconRenderer, /aria-hidden/);
	assert.match(coordinator, /new FutureIconRenderer\(\)\.connect\(\)/);
});

test("pointer aura owns a child layer instead of stealing hero pseudos", () => {
	assert.match(pointerAura, /future-aura-layer/);
	assert.match(surfaces, /> \.future-aura-layer/);
	assert.doesNotMatch(surfaces, /\[data-future-aura\]::before/);
});

test("primary hub pages explicitly adopt the system and icons", () => {
	for (const [name, source] of Object.entries({ games, apps, wallet, about })) {
		assert.match(source, /\/style\/future-system\/index\.css\?v=future-001/, `${name} future CSS`);
		assert.match(source, /\/scripts\/future-system\/index\.js\?v=future-001/, `${name} future JS`);
		assert.match(source, new RegExp(`data-future-page="${name}"`), `${name} page identity`);
		assert.match(source, /data-future-icon=/, `${name} semantic icon`);
	}
});

test("dynamic Games and Apps cards inherit future surfaces without renderer changes", () => {
	assert.match(surfaces, /data-future-page="games"\] \.gameCard/);
	assert.match(surfaces, /data-future-page="apps"\] \.g-app-card/);
});

test("Social opts into shared surfaces while mature OS and Torah remain independent", () => {
	assert.match(socialStyle, /\/style\/future-system\/index\.css\?v=future-001/);
	assert.doesNotMatch(os, /future-system/);
	assert.doesNotMatch(torah, /future-system/);
});
