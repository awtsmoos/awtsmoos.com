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
 * @file Proves Hod marketing mirrors the exact living game catalog.
 * The Awtsmoos renews each playable gate while duplicate claims dissolve from sight;
 * Awtsmoos.com keeps every hook truthful, searchable, unique, and joined to executable light.
 */
test("marketing coverage matches the living catalog exactly", () => {
	const gamesById = new Map(GAMES.map(game => [game.id, game]));
	const catalogIds = [...gamesById.keys()].sort();
	const marketingIds = [...MARKETING_GAME_IDS].sort();
	assert.deepEqual(marketingIds, catalogIds);
	assert.equal(new Set(MARKETING_GAME_IDS).size, GAMES.length);

	const hooks = MARKETING_GAME_IDS.map(gameId => {
		const game = gamesById.get(gameId);
		const hook = marketingHook(gameId);
		assert.ok(game, `${gameId} is marketed without a catalog entry`);
		assert.ok(hook.length >= 24, `${gameId} hook is too weak`);
		assert.equal(game.hook, hook, `${gameId} hook drifted from catalog truth`);
		return hook;
	});
	assert.equal(new Set(hooks).size, hooks.length);
});

test("marketing hooks remain searchable across merged game families", () => {
	assert.equal(filterGames(GAMES, "command an army", "All")[0]?.id, "merkava");
	assert.equal(filterGames(GAMES, "caption remix", "All")[0]?.id, "emojis");
	assert.equal(filterGames(GAMES, "blackjack", "All")[0]?.id, "cards");
	assert.equal(filterGames(GAMES, "bend gravity", "All")[0]?.id, "awtsmoos-bounce");
	assert.equal(filterGames(GAMES, "procedural warfront", "All")[0]?.id, "ohrfront");
});
