// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file storefront-cleanliness.test.mjs
 * @description
 * The Awtsmoos proves the Games doorway stays sharp and uncluttered, with no blur wall and no duplicate throne;
 * Awtsmoos.com keeps discovery near, cards quiet, launch targets generous, and cache identity truthful as versions move on.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { GAMES } from "../scripts/catalog/index.mjs";
import { gameCardMarkup } from "../scripts/catalog/markup.mjs";

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

const page = source("../index.html");
const manifest = source("../style.css");
const cssBundle = [
	"hero-core.css",
	"play-modes.css",
	"discovery.css",
	"collections.css",
	"cards-shell.css",
	"cards-meta.css",
	"responsive.css"
].map(file => source(`../styles/${file}`)).join("\n");
const markup = source("../scripts/catalog/markup.mjs");

test("storefront imports no blur owner and renders no duplicate glass hero panel", () => {
	assert.doesNotMatch(manifest, /hero-signal\.css/);
	assert.doesNotMatch(cssBundle, /backdrop-filter|filter\s*:\s*blur/i);
	assert.doesNotMatch(page, /heroSignal|walletRibbon/);
});

test("storefront enters discovery quickly with compact play facts", () => {
	assert.match(page, /style\.css\?v=games-storefront-\d+/);
	assert.match(page, /<section class="playModeRail"/);
	assert.doesNotMatch(page, /playModeCard/);
	assert.match(page, /<h2 id="discover-title">All games<\/h2>/);
});

test("cards keep one invitation instead of rendering the full catalog record", () => {
	assert.doesNotMatch(markup, /gameDescription|gameChips|commercePlan/);
	const html = gameCardMarkup(GAMES[0]);
	assert.match(html, /gameHook/);
	assert.match(html, /Play Solo/);
	assert.match(html, /Party Challenge/);
});

test("both launch actions meet the touch target floor", () => {
	assert.match(cssBundle, /\.playCta,[\s\S]*\.partyCta\s*\{[\s\S]*min-height:\s*46px/);
});

test("desktop catalog uses one consistent three-column rhythm", () => {
	assert.match(cssBundle, /\.gamesGrid,[\s\S]*\.gamesGrid--originals\s*\{[\s\S]*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
});
