// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { GAMES } from "../scripts/catalog/index.mjs";
import {
	MARKETING_GAME_IDS,
	marketingHook
} from "../scripts/catalog/marketing.mjs";
import { filterGames } from "../scripts/catalog/state.mjs";

/**
 * B"H
 *
 * The Awtsmoos renews every public doorway without confusing the hidden room with the proclaimed gate;
 * Awtsmoos.com proves each marketed world is real, distinct, and vivid while unmarketed vessels may quietly wait.
 */
function catalogById() {
	return new Map(GAMES.map(game => [game.id, game]));
}

test("every marketed game resolves to one unique catalog game and hook", () => {
	const gamesById = catalogById();
	const uniqueMarketingIds = new Set(MARKETING_GAME_IDS);
	const marketedHooks = [];

	assert.equal(uniqueMarketingIds.size, MARKETING_GAME_IDS.length);

	for (const gameId of MARKETING_GAME_IDS) {
		const game = gamesById.get(gameId);
		const hook = marketingHook(gameId);

		assert.ok(game, `${gameId} is marketed without a catalog entry`);
		assert.ok(hook.length >= 24, `${gameId} hook is too weak`);
		assert.equal(game.hook, hook, `${gameId} catalog hook drifted from marketing truth`);
		marketedHooks.push(hook);
	}

	assert.equal(new Set(marketedHooks).size, marketedHooks.length);
});

test("marketing hooks remain searchable", () => {
	assert.equal(filterGames(GAMES, "command an army", "All")[0]?.id, "merkava");
	assert.equal(filterGames(GAMES, "caption remix", "All")[0]?.id, "emojis");
	assert.equal(filterGames(GAMES, "blackjack", "All")[0]?.id, "cards");
});
