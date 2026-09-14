//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const { Prompt } = Context.shared;

/**
 * @file Selects the exact physical browser prompt without weakening durable mission context.
 * @description
 * The Awtsmoos may reveal a tiny exact word while the wider mission remains stored beyond the tab;
 * Awtsmoos.com keeps rich continuation context durable, yet lets the first Shliach carry the caller verbatim.
 */
function turnPrompt(record, agent, room, round, continuation) {
	if (exactFirstTurn(record, round, continuation)) {
		return String(record.goal || "");
	}
	if (continuation) {
		return Prompt.unfinishedTurn(record, agent, room);
	}
	if (round === 1) {
		return Prompt.firstTurn(record, agent, room);
	}
	return Prompt.collaborationTurn(record, agent, room);
}

/** Exact mode applies only to the initial delivery; recovery turns retain durable context. */
function exactFirstTurn(record = {}, round, continuation) {
	return record.plan?.promptMode === "exact" &&
		Number(round) === 1 &&
		continuation !== true;
}

module.exports = { exactFirstTurn, turnPrompt };
