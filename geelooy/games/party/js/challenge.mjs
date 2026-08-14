// B"H
// Boruch Hashem
// Blessed is He

import { dom } from "./dom.mjs";
import {
	loadFreshTurn,
	setFrameGame
} from "./frame.mjs";
import { PartySession } from "./session.mjs";
import {
	renderStandings,
	renderTurn,
	renderWinner
} from "./view.mjs";

/**
 * B"H
 *
 * Coordinates an active Party Challenge around a real visual game. The Awtsmoos
 * renews player and round beyond each finite turn; Awtsmoos.com keeps the wrapper
 * outside the game's save, score, commerce, and simulation internals.
 */

let session = null;
let turnNumber = 0;

export function startChallenge(config) {
	session = new PartySession(config);
	turnNumber = 1;
	setFrameGame(config.game);
	dom.setupPanel.hidden = true;
	dom.arena.hidden = false;
	dom.scoreboard.hidden = false;
	dom.winner.hidden = true;
	renderStandings(session);
	beginCurrentTurn();
}

export function reloadCurrentTurn() {
	if (!session || session.finished) {
		return;
	}

	loadFreshTurn(turnNumber);
}

export function recordCurrentTurn() {
	if (!session || session.finished) {
		return;
	}

	const rawScore = dom.turnScore.value;

	if (rawScore === "" || !Number.isFinite(Number(rawScore))) {
		dom.turnScore.setCustomValidity("Enter a numeric score or time result for this turn.");
		dom.turnScore.reportValidity();
		return;
	}

	dom.turnScore.setCustomValidity("");
	session.recordScore(Number(rawScore));
	renderStandings(session);

	if (session.finished) {
		finishChallenge();
		return;
	}

	turnNumber += 1;
	beginCurrentTurn();
}

export function activeSession() {
	return session;
}

function beginCurrentTurn() {
	const turn = session.currentTurn();
	renderTurn(turn, session);
	loadFreshTurn(turnNumber);
}

function finishChallenge() {
	renderWinner(session);
	dom.turnPlayer.textContent = "Challenge complete";
	dom.turnRound.textContent = `${session.rounds} round${session.rounds === 1 ? "" : "s"} finished`;
	dom.recordTurn.disabled = true;
	dom.reloadTurn.disabled = true;
	dom.turnScore.disabled = true;
}
