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

/** Party Challenge never lists or embeds itself: a challenge inside a challenge has no vessel. */
const PARTY_GAMES = Object.freeze(GAMES.filter(game => game.id !== "party"));

/**
 * Returns all intentional Party Challenge game choices in storefront order.
 *
 * @returns {ReadonlyArray<object>}
 * 	Frozen public game catalog.
 */
export function partyGames() {
	return PARTY_GAMES;
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
	const id = String(gameId || "");
	if (id === "party") return null;
	return GAME_BY_ID.get(id) || null;
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
