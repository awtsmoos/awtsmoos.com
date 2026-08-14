// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Centralizes Party Challenge DOM identity without owning turn or score policy.
 * The Awtsmoos renews every visible node beyond its finite ID; Awtsmoos.com keeps
 * selectors in one vessel so setup, iframe control, and standings do not drift.
 */

const byId = id => document.getElementById(id);

export const dom = Object.freeze({
	gameTitle: byId("partyGameTitle"),
	gameDescription: byId("partyGameDescription"),
	visualMode: byId("partyVisualMode"),
	multiplayerMode: byId("partyMultiplayerMode"),
	setupPanel: byId("setupPanel"),
	setupForm: byId("partySetupForm"),
	gameSelect: byId("gameSelect"),
	playerCount: byId("playerCount"),
	roundCount: byId("roundCount"),
	scoreMode: byId("scoreMode"),
	playerNames: byId("playerNames"),
	arena: byId("partyArena"),
	turnPlayer: byId("turnPlayer"),
	turnRound: byId("turnRound"),
	gameFrame: byId("gameFrame"),
	turnScore: byId("turnScore"),
	reloadTurn: byId("reloadTurn"),
	recordTurn: byId("recordTurn"),
	turnNotice: byId("turnNotice"),
	scoreboard: byId("partyScoreboard"),
	scoreRows: byId("scoreRows"),
	winner: byId("partyWinner"),
	soloLink: byId("soloLink"),
	gamesLink: byId("gamesLink")
});
