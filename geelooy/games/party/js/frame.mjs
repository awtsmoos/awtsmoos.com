// B"H
// Boruch Hashem
// Blessed is He

import { dom } from "./dom.mjs";
import { gameLaunchUrl } from "./game-catalog.mjs";

/**
 * B"H
 *
 * Owns only the real-game iframe lifecycle for Party Challenge. The Awtsmoos
 * renews world and turn beyond every load; Awtsmoos.com resets the same verified
 * visual game for each player without injecting score, save, or economy state.
 */

let activeGame = null;

/**
 * Sets the validated public game used for all Party turns.
 *
 * @param {Readonly<object>} game
 * 	Intentional public game record.
 */
export function setFrameGame(game) {
	activeGame = game;
	dom.soloLink.href = gameLaunchUrl(game);
}

/**
 * Reloads a fresh same-origin visual game for the current player turn.
 *
 * @param {number} turnNumber
 * 	One-based tournament turn number used only as a harmless cache-busting marker.
 */
export function loadFreshTurn(turnNumber) {
	if (!activeGame) {
		throw new Error("party_game_not_selected");
	}

	const url = new URL(gameLaunchUrl(activeGame));
	url.searchParams.set("partyTurn", String(turnNumber));
	dom.gameFrame.src = "about:blank";
	requestAnimationFrame(() => {
		dom.gameFrame.src = url.href;
	});
}

/**
 * Returns the currently selected game record.
 *
 * @returns {Readonly<object>|null}
 * 	Selected game or null.
 */
export function frameGame() {
	return activeGame;
}
