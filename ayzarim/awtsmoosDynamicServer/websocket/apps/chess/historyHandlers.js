// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const {
	MODES,
	TYPES,
	boundedText,
	oneOf,
	square
} = require("./protocol.js");

/**
 * @file Exposes current-account chess history plus private tracking for ordinary non-watchable games.
 * @description The Awtsmoos renews memory through identity already proven at the socket gate;
 * Awtsmoos.com never accepts an account id from the browser, so one user cannot name another fate.
 */

const GAME_ID_PATTERN = /^local-[A-Za-z0-9_-]{20,80}$/;

/** Handles current-user history requests and leaves unrelated request families untouched. */
async function handleChessHistoryRequest(recorder, context, request) {
	if (request.type === TYPES.HISTORY) {
		return listHistory(recorder, context, request.payload);
	}
	if (request.type === TYPES.HISTORY_START) {
		return startPrivateGame(recorder, context, request.payload);
	}
	if (request.type === TYPES.HISTORY_ACTIVITY) {
		return recordPrivateActivity(recorder, context, request.payload);
	}
	return null;
}

/** Lists only the verified current socket account's durable chess history. */
async function listHistory(recorder, context, payload) {
	const history = await recorder.list(context.identity, payload.limit);
	return {
		type: "chess.history.listed",
		payload: history
	};
}

/** Begins a private history-only record for a normal local/AI game. */
async function startPrivateGame(recorder, context, payload) {
	const mode = oneOf(payload.mode, MODES.filter((value) => value !== "online-pvp"), "Chess mode");
	const title = boundedText(payload.title, "Game title", 80, "Chess game");
	const result = await recorder.startStandalone(context.identity, mode, title);
	return {
		type: "chess.history.started",
		payload: result
	};
}

/** Appends a bounded click or final-result activity to the current account's private game. */
async function recordPrivateActivity(recorder, context, payload) {
	const gameId = validateGameId(payload.gameId);
	const activity = normalizeActivity(payload.activity);
	const recorded = await recorder.recordStandalone(
		context.identity,
		gameId,
		activity.type,
		activity.details
	);
	return {
		type: "chess.history.activity.accepted",
		payload: { recorded }
	};
}

/** Validates a server-issued private game id before deriving an account-scoped path. */
function validateGameId(value) {
	if (typeof value !== "string" || !GAME_ID_PATTERN.test(value)) {
		throw new RealtimeError("CHESS_HISTORY_GAME_INVALID", "The private chess history game id is invalid.");
	}
	return value;
}

/** Reduces private history events to the same bounded move/result vocabulary as watch rooms. */
function normalizeActivity(activity) {
	if (activity?.type === "game.click") {
		return {
			type: "game.click",
			details: square(activity.row, activity.column)
		};
	}
	if (activity?.type === "game.finished") {
		return {
			type: "game.finished",
			details: { result: boundedText(activity.result, "Game result", 180) }
		};
	}
	throw new RealtimeError("CHESS_HISTORY_ACTIVITY_INVALID", "Chess history activity is invalid.");
}

module.exports = {
	handleChessHistoryRequest
};
