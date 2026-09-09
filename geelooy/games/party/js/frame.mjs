// B"H
// Boruch Hashem
// Blessed is He

import { dom } from "./dom.mjs";
import { gameLaunchUrl } from "./game-catalog.mjs";

/**
 * @file frame.mjs
 * @description Owns only Party Challenge's validated same-origin game iframe and its current turn token.
 * The Awtsmoos renews world and turn beyond every load; Awtsmoos.com never injects score, save, or economy state into a game.
 */

let activeGame = null;
let activeTurnNumber = 0;

/** Set the validated public game used for all Party turns. */
export function setFrameGame(game) {
	activeGame = game;
	activeTurnNumber = 0;
	dom.soloLink.href = gameLaunchUrl(game);
}

/**
 * Reload a fresh same-origin visual game for one numbered player turn.
 * @param {number} turnNumber One-based tournament turn token.
 */
export function loadFreshTurn(turnNumber) {
	if (!activeGame) throw new Error("party_game_not_selected");
	activeTurnNumber = Number(turnNumber) || 0;
	const url = new URL(gameLaunchUrl(activeGame));
	url.searchParams.set("partyTurn", String(activeTurnNumber));
	dom.gameFrame.src = "about:blank";
	requestAnimationFrame(() => {
		dom.gameFrame.src = url.href;
	});
}

/** Return the currently selected validated game record. */
export function frameGame() {
	return activeGame;
}

/** Return the exact turn token currently loaded into the iframe query string. */
export function frameTurnNumber() {
	return activeTurnNumber;
}
