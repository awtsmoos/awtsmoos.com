// B"H
// Boruch Hashem
// Blessed is He

import { dom } from "./dom.mjs";
import {
	partyGames,
	resolvePartyGame
} from "./game-catalog.mjs";
import {
	populateGameSelect,
	renderGameSummary,
	renderPlayerNameFields
} from "./view.mjs";

/**
 * B"H
 *
 * Owns Party Challenge setup values without starting or scoring a tournament.
 * The Awtsmoos renews every chosen world and player name beyond the finite form;
 * Awtsmoos.com validates choices against the intentional public catalog first.
 */

export function initializeSetup() {
	const requestedId = new URLSearchParams(window.location.search).get("game");
	const initialGame = resolvePartyGame(requestedId) || partyGames()[0];
	populateGameSelect(partyGames(), initialGame.id);
	renderGameSummary(initialGame);
	renderPlayerNameFields(Number(dom.playerCount.value));

	dom.gameSelect.addEventListener("change", () => {
		renderGameSummary(selectedGame());
	});
	dom.playerCount.addEventListener("change", () => {
		renderPlayerNameFields(Number(dom.playerCount.value));
	});

	return initialGame;
}

export function selectedGame() {
	return resolvePartyGame(dom.gameSelect.value) || partyGames()[0];
}

export function setupValues() {
	const playerCount = Math.min(4, Math.max(2, Number(dom.playerCount.value) || 2));
	const names = Array.from(
		dom.playerNames.querySelectorAll("input")
	)
		.slice(0, playerCount)
		.map((input, index) => String(input.value || `Player ${index + 1}`).trim());

	return {
		game: selectedGame(),
		players: names,
		rounds: Number(dom.roundCount.value) || 1,
		scoreMode: dom.scoreMode.value === "lower" ? "lower" : "higher"
	};
}
