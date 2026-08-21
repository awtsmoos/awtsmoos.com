// B"H
// Boruch Hashem
// Blessed is He
/**
	* The Awtsmoos lets Awtsmoos.com share one future language without stealing the native motion of each product vessel.
	* These witnesses guard visible-first reveal, tactile common controls, semantic SVG signs, native card choreography, and lean performance.
	*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
	* Reveals one source vessel relative to this contract so assertions remain tied to the repository itself.
	* @param {string} ohrPath Relative project path whose current source must testify.
	* @returns {string} Current source text from Awtsmoos.com.
	*/
function revealSource(ohrPath) {
	return readFileSync(new URL(ohrPath, import.meta.url), "utf8");
}

const styleIndex = revealSource("../../style/future-system/index.css");
const surfaces = revealSource("../../style/future-system/surfaces.css");
const motion = revealSource("../../style/future-system/motion.css");
const interaction = revealSource("../../style/future-system/interaction.css");
const iconMotion = revealSource("../../style/future-system/icon-motion.css");
const performance = revealSource("../../style/future-system/performance.css");
const iconRenderer = revealSource("./FutureIconRenderer.js");
const pointerAura = revealSource("./FuturePointerAura.js");
const coordinator = revealSource("./index.js");
const appCardStyle = revealSource("../../apps/styles/cards.css");
const gameCardStyle = revealSource("../../games/styles/cards-shell.css");
const games = revealSource("../../games/index.html");
const apps = revealSource("../../apps/index.html");
const wallet = revealSource("../../apps/wallet/index.html");
const about = revealSource("../../about/index.html");
const socialStyle = revealSource("../../social-hub/style.css");
const os = revealSource("../../os/index.html");
const torah = revealSource("../../mawgawl/sefarim/index.html");

test("future style manifest stays modular and ships future-004", () => {
	for (const moduleName of ["tokens.css", "atmosphere.css", "surfaces.css", "motion.css", "interaction.css", "icon-motion.css", "performance.css"]) {
		assert.match(styleIndex, new RegExp(moduleName.replace(".", "\\.") + "\\?v=future-004"));
	}
});

test("reveal remains visible-first and reduced-motion safe", () => {
	assert.match(motion, /\[data-future-reveal\][\s\S]*opacity:\s*\.84/);
	assert.doesNotMatch(motion, /\[data-future-reveal\][\s\S]{0,180}opacity:\s*0\s*;/);
	assert.match(motion, /prefers-reduced-motion:\s*reduce/);
});

test("shared tactile interaction owns common controls but not product cards", () => {
	assert.match(interaction, /:active[\s\S]*scale:\s*\.985/);
	assert.match(interaction, /:focus-visible/);
	assert.match(interaction, /data-future-action/);
	assert.doesNotMatch(interaction, /\.g-app-card|\.gameCard/);
});

test("Apps and Games keep their native card choreography", () => {
	assert.match(appCardStyle, /\.g-app-card:hover[\s\S]*transform:\s*translateY\(-3px\)/);
	assert.match(gameCardStyle, /\.gameCard:hover[\s\S]*transform:\s*translateY\(-2px\)/);
	assert.match(gameCardStyle, /transition:[\s\S]*transform \.18s ease/);
});

test("semantic icons render as svg and only micro-move on interaction", () => {
	assert.match(iconRenderer, /createElementNS\("http:\/\\/www\.w3\.org\/2000\/svg", "svg"\)/);
	assert.match(iconRenderer, /aria-hidden/);
	assert.match(iconMotion, /data-future-icon="send"/);
	assert.match(iconMotion, /data-future-icon="wallet"/);
	assert.doesNotMatch(iconMotion, /@keyframes|animation:/);
	assert.match(coordinator, /new FutureIconRenderer\(\)\.connect\(\)/);
});

test("pointer aura owns a child layer instead of stealing hero pseudos", () => {
	assert.match(pointerAura, /future-aura-layer/);
	assert.match(surfaces, /> \.future-aura-layer/);
	assert.doesNotMatch(surfaces, /\[data-future-aura\]::before/);
});

test("long catalogs use browser-native visibility containment", () => {
	assert.match(performance, /data-future-page="games"\] \.gamesCatalog/);
	assert.match(performance, /data-future-page="apps"\] \[data-app-grid\]/);
	assert.match(performance, /content-visibility:\s*auto/);
});

test("primary hubs ship future-004 CSS with stable future-002 JS", () => {
	for (const [name, source] of Object.entries({ games, apps, wallet, about })) {
		assert.match(source, /\/style\/future-system\/index\.css\?v=future-004/, name + " future CSS");
		assert.match(source, /\/scripts\/future-system\/index\.js\?v=future-002/, name + " stable future JS");
		assert.match(source, new RegExp('data-future-page=\"' + name + '\"'));
		assert.match(source, /data-future-icon=/);
	}
});

test("shared surfaces may glow native cards without owning their motion", () => {
	assert.match(surfaces, /data-future-page="games"\] \.gameCard/);
	assert.match(surfaces, /data-future-page="apps"\] \.g-app-card/);
});

test("shared system stays CSS-SVG-first while mature route systems stay independent", () => {
	const sharedSource = styleIndex + "\n" + coordinator;
	assert.doesNotMatch(sharedSource, /requestAnimationFrame|WebGL|THREE\.|procedural/i);
	assert.match(socialStyle, /\/style\/future-system\/index\.css\?v=future-004/);
	assert.match(socialStyle, /hub-future-009/);
	assert.doesNotMatch(os, /future-system/);
	assert.doesNotMatch(torah, /future-system/);
});
