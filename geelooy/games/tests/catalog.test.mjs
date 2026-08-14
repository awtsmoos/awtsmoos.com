// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file catalog.test.mjs
 * @description
 * The Awtsmoos proves the catalog remains rich truth beneath a quieter storefront:
 * every real doorway, collection, search field, and launch mode survives while visible cards stay clean.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GAMES, GAME_COLLECTIONS } from "../scripts/catalog/index.mjs";
import { collectTags, filterGames, groupGames } from "../scripts/catalog/state.mjs";
import { gameCardMarkup } from "../scripts/catalog/markup.mjs";

const gamesRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("catalog markets twenty-five intentional game doorways", () => {
	assert.equal(GAMES.length, 25);
	assert.equal(new Set(GAMES.map(game => game.id)).size, GAMES.length);
	assert.equal(new Set(GAMES.map(game => game.href)).size, GAMES.length);
});

test("every marketed game points to a real directory", () => {
	for (const game of GAMES) {
		const doorway = path.resolve(gamesRoot, game.href);
		assert.equal(fs.existsSync(doorway), true, `${game.title} missing at ${doorway}`);
	}
});

test("Merkava remains the featured flagship original", () => {
	const merkava = GAMES.find(game => game.id === "merkava");
	assert.ok(merkava);
	assert.equal(merkava.href, "./Merkava/");
	assert.equal(merkava.collection, "originals");
	assert.equal(merkava.featured, true);
	assert.equal(merkava.badge, "Flagship");
});

test("prototype and educational visualization folders stay intentionally unmarketed", () => {
	const hrefs = new Set(GAMES.map(game => game.href));
	assert.equal(hrefs.has("./adventure/"), false);
	assert.equal(hrefs.has("./rambam/"), false);
});

test("collection structure preserves originals-first marketing order", () => {
	assert.deepEqual(
		GAME_COLLECTIONS.map(collection => collection.id),
		["originals", "adventures", "quick"]
	);
	const grouped = groupGames(GAMES, GAME_COLLECTIONS);
	assert.deepEqual(grouped.map(section => section.games.length), [9, 9, 7]);
});

test("search still reaches rich catalog copy and play-mode tags", () => {
	assert.equal(filterGames(GAMES, "five worlds", "All")[0]?.id, "merkava");
	assert.ok(filterGames(GAMES, "RPG", "All").length >= 3);
	assert.ok(filterGames(GAMES, "", "Quick Play").length >= 6);
	assert.equal(filterGames(GAMES, "Party Challenge", "All").length, 25);
});

test("tag collection remains unique and keeps All first", () => {
	const tags = collectTags(GAMES);
	assert.equal(tags[0], "All");
	assert.equal(new Set(tags).size, tags.length);
});

test("card markup escapes text, keeps both launches, and omits duplicate content walls", () => {
	const html = gameCardMarkup({
		...GAMES[0],
		title: "<Merkava & Friends>"
	});
	assert.match(html, /&lt;Merkava &amp; Friends&gt;/);
	assert.doesNotMatch(html, /<Merkava & Friends>/);
	assert.match(html, /Play Solo/);
	assert.match(html, /Party Challenge/);
	assert.doesNotMatch(html, /gameDescription/);
	assert.doesNotMatch(html, /gameChips/);
});

test("native multiplayer is exceptional metadata rather than a repeated three-chip row", () => {
	const nativeGame = GAMES.find(game => game.multiplayer.mode === "native");
	const ordinaryGame = GAMES.find(game => game.multiplayer.mode !== "native");
	assert.match(gameCardMarkup(nativeGame), /modeChip--native/);
	assert.doesNotMatch(gameCardMarkup(ordinaryGame), /class="gameModes"/);
});
