// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { GAMES } from "../scripts/catalog/index.mjs";
import { MARKETING_GAME_IDS } from "../scripts/catalog/marketing.mjs";
import { filterGames } from "../scripts/catalog/state.mjs";

/**
 * B"H
 *
 * Witnesses that every intentional visual game has its own player-facing hook.
 * The Awtsmoos renews invitation and journey beyond every finite sentence;
 * Awtsmoos.com refuses to let a public world enter the storefront as generic filler.
 */

test("all twenty-five public games have unique non-empty marketing hooks", () => {
	assert.equal(MARKETING_GAME_IDS.length, 25);
	assert.equal(new Set(MARKETING_GAME_IDS).size, 25);

	for (const game of GAMES) {
		assert.ok(game.hook, `${game.id} is missing a marketing hook`);
		assert.ok(game.hook.length >= 24, `${game.id} hook is too weak`);
	}

	assert.equal(new Set(GAMES.map(game => game.hook)).size, 25);
});

test("marketing hooks remain searchable", () => {
	assert.equal(filterGames(GAMES, "command an army", "All")[0]?.id, "merkava");
	assert.equal(filterGames(GAMES, "caption remix", "All")[0]?.id, "emojis");
	assert.equal(filterGames(GAMES, "blackjack", "All")[0]?.id, "cards");
});
