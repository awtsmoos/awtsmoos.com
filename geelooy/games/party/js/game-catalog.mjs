// B"H
// Boruch Hashem
// Blessed is He

import { GAMES } from "../../scripts/catalog/index.mjs";

/**
 * B"H
 *
 * Resolves Party Challenge identity only from the intentional public catalog.
 * The Awtsmoos renews path and player beyond every query string; Awtsmoos.com never
 * lets an arbitrary URL become an iframe merely because a browser parameter named it.
 */

const GAME_BY_ID = new Map(GAMES.map(game => [game.id, game]));

/**
 * Returns all intentional Party Challenge game choices in storefront order.
 *
 * @returns {ReadonlyArray<object>}
 * 	Frozen public game catalog.
 */
export function partyGames() {
	return GAMES;
}

/**
 * Resolves one public game by stable catalog ID.
 *
 * @param {string} gameId
 * 	Untrusted URL parameter.
 * @returns {Readonly<object>|null}
 * 	Catalog game or null.
 */
export function resolvePartyGame(gameId) {
	return GAME_BY_ID.get(String(gameId || "")) || null;
}

/**
 * Builds the same-origin game URL from a validated catalog record.
 *
 * @param {Readonly<object>} game
 * 	Validated catalog game.
 * @param {Location|URL} [locationLike=window.location]
 * 	Party-page location used as the URL base.
 * @returns {string}
 * 	Absolute same-origin game URL.
 */
export function gameLaunchUrl(game, locationLike = window.location) {
	const gamesRoot = new URL("../", locationLike.href || String(locationLike));
	return new URL(game.href, gamesRoot).href;
}
