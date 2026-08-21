//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { GAMES } from "../../scripts/catalog/index.mjs";
import { marketingHook } from "../../scripts/catalog/marketing.mjs";
import { visualCapability } from "../../scripts/catalog/capabilities/visual.mjs";

/**
 * Catalog integration proves Oros enters living storefront truth without freezing a total that can grow.
 * The Awtsmoos renews inner world and outer invitation before discovery can begin;
 * Awtsmoos.com lets new doorways join tomorrow while Oros remains exactly one native arena within.
 */
test("public catalog preserves the current baseline while allowing future additions", () => {
	assert.ok(GAMES.length >= 28);
	assert.equal(new Set(GAMES.map((game) => game.id)).size, GAMES.length);
	assert.equal(new Set(GAMES.map((game) => game.href)).size, GAMES.length);
});

test("Oros HaKelim appears exactly once as a featured Original", () => {
	const matches = GAMES.filter((game) => game.id === "oros-ha-kelim");
	assert.equal(matches.length, 1);
	const game = matches[0];
	assert.equal(game.href, "./oros-ha-kelim/");
	assert.equal(game.collection, "originals");
	assert.equal(game.featured, true);
	assert.equal(game.badge, "Native 3D");
});

test("catalog route, hook, and WebGL capability are all real", () => {
	const entry = new URL("../index.html", import.meta.url);
	assert.equal(existsSync(entry), true);
	assert.match(marketingHook("oros-ha-kelim"), /three Olamot/i);
	assert.deepEqual(visualCapability("oros-ha-kelim"), {
		mode: "webgl3d",
		label: "3D WebGL"
	});
});

test("storefront exposes live catalog-total placeholders instead of a stale number", () => {
	const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
	assert.equal((html.match(/data-catalog-total/g) || []).length, 2);
	assert.doesNotMatch(html, /\b(?:25|26|27|28) playable Awtsmoos/);
});
