// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelCosmicProfileContractTest
 * @description
 * The Awtsmoos verifies that the real Heichel route owns one compact profile,
 * one canonical cosmic scene, exact colors, live counters, and bounded modules.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const ROOT = "geelooy";
const read = path => readFileSync(`${ROOT}/${path}`, "utf8");
const html = read("heichelos/heichel/_awtsmoos.heichel.html");
const shell = read("heichelos/heichel/modules/ui/blueprints/layout-shell.js");
const boot = read("heichelos/heichel/modules/cosmic/boot.js");
const interactions = read("heichelos/heichel/modules/cosmic/interactions.js");
const world = read("heichelos/heichel/modules/ui/heichel-os/world-panel.js");
const manifest = read("style/heichelos/heichel/cosmic-profile/index.css");
const tokens = read("style/heichelos/heichel/cosmic-profile/tokens.css");
const cards = read("style/heichelos/heichel/cosmic-profile/cards.css");
const mobile = read("style/heichelos/heichel/cosmic-profile/mobile-dock.css");

const TOUCHED = [
	"heichelos/heichel/modules/ui/blueprints/layout-shell.js",
	"heichelos/heichel/modules/ui/heichel-os/world-panel.js",
	"heichelos/heichel/modules/ui/heichel-os/world-data.js",
	"heichelos/heichel/modules/ui/heichel-os/world-blueprints.js",
	"heichelos/heichel/modules/cosmic/boot.js",
	"heichelos/heichel/modules/cosmic/interactions.js",
	"style/heichelos/heichel/cosmic-profile/index.css",
	"style/heichelos/heichel/cosmic-profile/tokens.css",
	"style/heichelos/heichel/cosmic-profile/atmosphere.css",
	"style/heichelos/heichel/cosmic-profile/topbar.css",
	"style/heichelos/heichel/cosmic-profile/profile.css",
	"style/heichelos/heichel/cosmic-profile/profile-controls.css",
	"style/heichelos/heichel/cosmic-profile/content.css",
	"style/heichelos/heichel/cosmic-profile/cards.css",
	"style/heichelos/heichel/cosmic-profile/card-content.css",
	"style/heichelos/heichel/cosmic-profile/world.css",
	"style/heichelos/heichel/cosmic-profile/responsive.css",
	"style/heichelos/heichel/cosmic-profile/mobile-dock.css"
];

const EXACT_COLORS = [
	"#04040C", "#040C1C", "#040C24", "#041424", "#0C1424", "#0C1C2C",
	"#01A1E6", "#50D7FF", "#2466BA", "#349BFF", "#543AA5", "#8575FF",
	"#9643C3", "#A35AFF", "#CB52B1", "#DA61C2", "#2AA29E", "#F6F8FF"
];

test("the real route loads the final theme and canonical scene", () => {
	assert.match(html, /cosmic-profile\/index\.css/);
	assert.match(html, /modules\/cosmic\/boot\.js/);
	assert.match(boot, /\/libs\/awtsmoos-procedural-core/);
	assert.doesNotMatch(boot, /libs\/awtsmoos\/procedural-core/);
});

test("the giant institution hero is replaced by compact profile identity", () => {
	assert.match(shell, /data-heichel-profile/);
	assert.match(shell, /heichel-profile-cover/);
	assert.match(shell, /data-heichel-profile-count/);
	assert.match(shell, /Follow/);
	assert.match(shell, /Message/);
	assert.doesNotMatch(shell, /Current Heichel|🏛️/);
});

test("live content state paints profile counts", () => {
	assert.match(world, /content\.posts/);
	assert.match(world, /content\.subSeries/);
	assert.match(world, /data-heichel-profile-count/);
});

test("semantic cards and interaction colors cover all source families", () => {
	for (const family of ["reflection", "audio", "question", "graph"]) {
		assert.ok(interactions.includes(family));
	}
	assert.match(cards, /Source teaching/);
	assert.match(cards, /Audio teaching/);
	assert.match(cards, /Open question/);
	assert.match(cards, /Source graph/);
});

test("the exact reference palette and compact dock remain present", () => {
	for (const color of EXACT_COLORS) assert.ok(tokens.includes(color), `missing ${color}`);
	assert.match(mobile, /min-height: 4\.25rem/);
	assert.match(mobile, /repeat\(5, minmax\(0, 1fr\)\)/);
});

test("the manifest owns every focused visual vessel", () => {
	for (const file of ["tokens", "atmosphere", "topbar", "profile", "profile-controls", "content", "cards", "card-content", "world", "responsive", "mobile-dock"]) {
		assert.ok(manifest.includes(`./${file}.css`), `manifest missing ${file}`);
	}
});

test("every touched source remains at or below 120 lines", () => {
	for (const path of TOUCHED) {
		const lines = read(path).split("\n").length;
		assert.ok(lines <= 120, `${path} has ${lines} lines`);
	}
});
