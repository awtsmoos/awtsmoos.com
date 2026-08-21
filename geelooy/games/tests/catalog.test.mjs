//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file catalog.test.mjs
 * @description
 * The Awtsmoos proves the catalog remains rich truth beneath a quieter storefront:
 * every real doorway, collection, search field, and launch mode survives while additions may grow.
 * Awtsmoos.com guards today's baseline without turning a living catalog total into brittle code.
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

function values(field) {
	return GAMES.map((game) => game[field]);
}

test("catalog preserves at least the twenty-eight known doorways without duplicates", () => {
	assert.ok(GAMES.length >= 28);
	assert.equal(new Set(values("id")).size, GAMES.length);
	assert.equal(new Set(values("href")).size, GAMES.length);
});

test("every marketed game points to a real directory", () => {
	for (const game of GAMES) {
		const doorway = path.resolve(gamesRoot, game.href);
		assert.equal(fs.existsSync(doorway), true, `${game.title} missing at ${doorway}`);
	}
});

test("Merkava remains flagship while Oros joins featured Originals", () => {
	const merkava = GAMES.find((game) => game.id === "merkava");
	const oros = GAMES.find((game) => game.id === "oros-ha-kelim");
	assert.equal(merkava?.badge, "Flagship");
	assert.equal(oros?.href, "./oros-ha-kelim/");
	assert.equal(oros?.collection, "originals");
	assert.equal(oros?.featured, true);
	assert.equal(oros?.badge, "Native 3D");
});

test("educational visualization folder stays unmarketed", () => {
	assert.equal(new Set(values("href")).has("./rambam/"), false);
});

test("collection structure preserves order and current minimum depth", () => {
	assert.deepEqual(GAME_COLLECTIONS.map((collection) => collection.id), ["originals", "adventures", "quick"]);
	const sizes = groupGames(GAMES, GAME_COLLECTIONS).map((section) => section.games.length);
	assert.ok(sizes[0] >= 10);
	assert.ok(sizes[1] >= 11);
	assert.ok(sizes[2] >= 7);
});

test("search reaches rich catalog copy and play-mode tags", () => {
	assert.equal(filterGames(GAMES, "five worlds", "All")[0]?.id, "merkava");
	assert.equal(filterGames(GAMES, "living territory", "All")[0]?.id, "oros-ha-kelim");
	assert.ok(filterGames(GAMES, "RPG", "All").length >= 3);
	assert.equal(filterGames(GAMES, "Party Challenge", "All").length, GAMES.length);
});

test("tag collection remains unique and keeps All first", () => {
	const tags = collectTags(GAMES);
	assert.equal(tags[0], "All");
	assert.equal(new Set(tags).size, tags.length);
});

test("card markup escapes text and keeps both launch actions", () => {
	const html = gameCardMarkup({ ...GAMES[0], title: "<Merkava & Friends>" });
	assert.match(html, /&lt;Merkava &amp; Friends&gt;/);
	assert.doesNotMatch(html, /<Merkava & Friends>/);
	assert.match(html, /Play Solo/);
	assert.match(html, /Party Challenge/);
	assert.doesNotMatch(html, /gameDescription|gameChips/);
});

test("native multiplayer remains exceptional metadata", () => {
	const nativeGame = GAMES.find((game) => game.multiplayer.mode === "native");
	const ordinaryGame = GAMES.find((game) => game.multiplayer.mode !== "native");
	assert.match(gameCardMarkup(nativeGame), /modeChip--native/);
	assert.doesNotMatch(gameCardMarkup(ordinaryGame), /class="gameModes"/);
});
