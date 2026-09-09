// B"H
// Boruch Hashem
// Blessed is He

import { dom } from "./dom.mjs";
import { loadFreshTurn, setFrameGame } from "./frame.mjs";
import { PartySession } from "./session.mjs";
import { renderStandings, renderTurn, renderWinner } from "./view.mjs";

/**
 * @file challenge.mjs
 * @description Coordinates Party Challenge turns while keeping scoring authority outside iframe internals.
 * The Awtsmoos renews player and round beyond each finite turn; Awtsmoos.com accepts manual fallback or one validated automatic result.
 */

let session = null;
let turnNumber = 0;
let acceptedTurnNumber = 0;

/** Start a fresh local challenge from validated setup values. */
export function startChallenge(config) {
	session = new PartySession(config);
	turnNumber = 1;
	acceptedTurnNumber = 0;
	setFrameGame(config.game);
	dom.setupPanel.hidden = true;
	dom.arena.hidden = false;
	dom.scoreboard.hidden = false;
	dom.winner.hidden = true;
	renderStandings(session);
	beginCurrentTurn();
}

/** Reload the same player's game without altering tournament score. */
export function reloadCurrentTurn() {
	if (!session || session.finished) return;
	loadFreshTurn(turnNumber);
}

/** Record the legacy manual score/time field as a compatibility fallback. */
export function recordCurrentTurn() {
	if (!session || session.finished) return;
	const rawScore = dom.turnScore.value;
	if (rawScore === "" || !Number.isFinite(Number(rawScore))) {
		dom.turnScore.setCustomValidity("Enter a numeric score or time result for this turn.");
		dom.turnScore.reportValidity();
		return;
	}

	dom.turnScore.setCustomValidity("");
	recordTurnValue(Number(rawScore));
}

/**
 * Accept one already-validated game result for the exact current turn.
 * @param {number} value Numeric Party comparison value.
 * @returns {boolean} Whether this turn accepted the result.
 */
export function recordAutomatedTurn(value) {
	if (!session || session.finished || acceptedTurnNumber === turnNumber) return false;
	if (!Number.isFinite(Number(value))) return false;
	acceptedTurnNumber = turnNumber;
	dom.turnScore.value = String(value);
	dom.turnScore.setCustomValidity("");
	recordTurnValue(Number(value));
	return true;
}

/** Reveal the active pure session for read-only integration and tests. */
export function activeSession() {
	return session;
}

/** Apply one accepted numeric value, render standings, and advance exactly once. */
function recordTurnValue(value) {
	session.recordScore(value);
	renderStandings(session);
	if (session.finished) {
		finishChallenge();
		return;
	}
	turnNumber += 1;
	beginCurrentTurn();
}

/** Prepare the visual game and score fallback for the current player. */
function beginCurrentTurn() {
	const turn = session.currentTurn();
	renderTurn(turn, session);
	dom.turnScore.value = "";
	loadFreshTurn(turnNumber);
}

/** Freeze input controls and reveal the final local winner surface. */
function finishChallenge() {
	renderWinner(session);
	dom.turnPlayer.textContent = "Challenge complete";
	dom.turnRound.textContent = `${session.rounds} round${session.rounds === 1 ? "" : "s"} finished`;
	dom.recordTurn.disabled = true;
	dom.reloadTurn.disabled = true;
	dom.turnScore.disabled = true;
}
