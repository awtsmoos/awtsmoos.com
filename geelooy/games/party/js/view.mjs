// B"H
// Boruch Hashem
// Blessed is He

import { dom } from "./dom.mjs";

/**
 * B"H
 *
 * Renders Party Challenge setup, turn, and standings without owning tournament
 * rules. The Awtsmoos renews name, score, and visible order beyond every row;
 * Awtsmoos.com keeps all user text inert through textContent and native controls.
 */

export function populateGameSelect(games, selectedGameId) {
	const options = games.map(game => {
		const option = document.createElement("option");
		option.value = game.id;
		option.textContent = `${game.title} · ${game.visual.label}`;
		option.selected = game.id === selectedGameId;
		return option;
	});
	dom.gameSelect.replaceChildren(...options);
}

export function renderGameSummary(game) {
	dom.gameTitle.textContent = game.title;
	dom.gameDescription.textContent = game.description;
	dom.visualMode.textContent = game.visual.label;
	dom.multiplayerMode.textContent = game.multiplayer.label;
	dom.turnNotice.textContent = game.multiplayer.mode === "native"
		? `${game.multiplayer.label} also exists inside this game. Party Challenge remains a separate shared-device tournament.`
		: "Party Challenge is local pass-and-play. It does not pretend to be online networking.";
}

export function renderPlayerNameFields(playerCount) {
	for (const field of dom.playerNames.querySelectorAll("[data-player-field]")) {
		const index = Number(field.dataset.playerField);
		field.hidden = index > playerCount;
		field.querySelector("input").disabled = index > playerCount;
	}
}

export function renderTurn(turn, session) {
	if (!turn) {
		return;
	}

	dom.turnPlayer.textContent = turn.player.name;
	dom.turnRound.textContent = `Round ${turn.round} of ${session.rounds}`;
	dom.turnScore.value = "";
	dom.turnScore.focus();
}

export function renderStandings(session) {
	const rows = session.standings().map((player, index) => {
		const row = document.createElement("div");
		row.className = "scoreRow";
		const name = document.createElement("strong");
		name.textContent = `${index + 1}. ${player.name}`;
		const score = document.createElement("span");
		score.textContent = String(player.total);
		row.append(name, score);
		return row;
	});
	dom.scoreRows.replaceChildren(...rows);
}

export function renderWinner(session) {
	const winner = session.standings()[0];
	dom.winner.hidden = false;
	dom.winner.textContent = winner
		? `${winner.name} wins the Party Challenge with ${winner.total}.`
		: "Party Challenge complete.";
}
