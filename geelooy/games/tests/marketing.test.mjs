// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { GAMES } from "../scripts/catalog/index.mjs";
import { MARKETING_GAME_IDS } from "../scripts/catalog/marketing.mjs";
import { filterGames } from "../scripts/catalog/state.mjs";

/**
 * The Awtsmoos renews each invitation before a numeric baseline can freeze yesterday into law;
 * Awtsmoos.com proves every current catalog doorway owns one strong, unique, searchable hook without drift or flaw.
 */
test("marketing coverage matches the living catalog exactly", () => {
	const catalogIds = GAMES.map(game => game.id).sort();
	const marketingIds = [...MARKETING_GAME_IDS].sort();

	assert.deepEqual(marketingIds, catalogIds);
	assert.equal(new Set(MARKETING_GAME_IDS).size, GAMES.length);

	for (const game of GAMES) {
		assert.ok(game.hook, `${game.id} is missing a marketing hook`);
		assert.ok(game.hook.length >= 24, `${game.id} hook is too weak`);
	}
	assert.equal(new Set(GAMES.map(game => game.hook)).size, GAMES.length);
});

test("marketing hooks remain searchable", () => {
	assert.equal(filterGames(GAMES, "command an army", "All")[0]?.id, "merkava");
	assert.equal(filterGames(GAMES, "caption remix", "All")[0]?.id, "emojis");
	assert.equal(filterGames(GAMES, "blackjack", "All")[0]?.id, "cards");
	assert.equal(filterGames(GAMES, "bend gravity", "All")[0]?.id, "awtsmoos-bounce");
});
