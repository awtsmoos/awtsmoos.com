// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Names and bounds every chess realtime request before domain state sees it.
 * @description The Awtsmoos renews each message inside a measured keli of light;
 * Awtsmoos.com lets rooms grow social while Gevurah keeps every field right.
 */

const APPLICATION_ID = "chess";
const VERSION = 1;
const TYPES = Object.freeze({
	CREATE: "chess.room.create",
	JOIN: "chess.room.join",
	WATCH: "chess.room.watch",
	LIST: "chess.room.list",
	CLICK: "chess.click.submit",
	FINISH: "chess.game.finish",
	PUBLISH: "chess.event.publish",
	CHAT: "chess.chat.send",
	MEDIA_STATE: "chess.media.state",
	MEDIA_SIGNAL: "chess.media.signal",
	HISTORY: "chess.history.list",
	HISTORY_START: "chess.history.start",
	HISTORY_ACTIVITY: "chess.history.activity"
});
const EVENTS = Object.freeze({
	READY: "chess.room.ready",
	PRESENCE: "chess.room.presence",
	GAME: "chess.game.event",
	CLICK: "chess.click",
	CHAT: "chess.chat.message",
	MEDIA_SIGNAL: "chess.media.signal"
});
const MODES = Object.freeze(["online-pvp", "pva", "local-pvp", "ava"]);
const VISIBILITIES = Object.freeze(["unlisted", "public"]);
const ROOM_PATTERN = /^[A-Za-z0-9_-]{20,80}$/;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,100}$/;

/** Returns one bounded string or a structured realtime failure. */
function boundedText(value, label, maximum, fallback = "") {
	const text = String(value ?? fallback).trim();
	if (text.length > maximum) {
		throw new RealtimeError("CHESS_TEXT_TOO_LONG", `${label} is too long.`);
	}
	return text;
}

/** Restricts a value to one of the protocol's explicit alternatives. */
function oneOf(value, allowed, label) {
	if (!allowed.includes(value)) {
		throw new RealtimeError("CHESS_VALUE_INVALID", `${label} is invalid.`);
	}
	return value;
}

/** Validates an opaque room capability identifier. */
function roomId(value) {
	if (typeof value !== "string" || !ROOM_PATTERN.test(value)) {
		throw new RealtimeError("CHESS_ROOM_ID_INVALID", "The chess room id is invalid.");
	}
	return value;
}

/** Validates an optional reconnect token without treating it as identity. */
function playerToken(value = "") {
	if (!value) {
		return "";
	}
	if (typeof value !== "string" || !TOKEN_PATTERN.test(value)) {
		throw new RealtimeError("CHESS_PLAYER_TOKEN_INVALID", "The chess reconnect token is invalid.");
	}
	return value;
}

/** Validates one rendered chess square. */
function square(row, column) {
	const valid = [row, column].every((value) => Number.isInteger(value) && value >= 0 && value < 8);
	if (!valid) {
		throw new RealtimeError("CHESS_SQUARE_INVALID", "Chess squares must be integers from 0 through 7.");
	}
	return { row, column };
}

module.exports = {
	APPLICATION_ID,
	EVENTS,
	MODES,
	TYPES,
	VERSION,
	VISIBILITIES,
	boundedText,
	oneOf,
	playerToken,
	roomId,
	square
};
