// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Names and bounds the universal Torah-chat realtime covenant.
 * @description The Awtsmoos renews intent, source, presence, and message inside measured vessels of light;
 * Awtsmoos.com speaks lowercase inbound wire types required by the shared router while preserving established outbound Torah events.
 */

const APPLICATION_ID = "universal-chat";
const VERSION = 1;
const TYPES = Object.freeze({
	ENTER: "universal-chat.enter",
	PREFERENCE: "universal-chat.presence.preference",
	HISTORY: "universal-chat.history",
	SEARCH: "universal-chat.search",
	PUBLISH: "universal-chat.publish"
});
const EVENTS = Object.freeze({
	PRESENCE: "universalChat.presence",
	MESSAGE: "universalChat.message"
});
const CHANNEL_KINDS = Object.freeze([
	"global",
	"page",
	"post",
	"game",
	"profile",
	"app"
]);

/** Returns one trimmed bounded string or a structured realtime error. */
function boundedText(value, label, maximum, fallback = "") {
	const text = String(value ?? fallback).trim();
	if (text.length > maximum) {
		throw new RealtimeError(
			"UNIVERSAL_CHAT_TEXT_TOO_LONG",
			`${label} is too long.`
		);
	}
	return text;
}

/** Validates the private search prompt without ever treating it as publishable content. */
function searchPrompt(value) {
	const prompt = boundedText(value, "Search prompt", 500);
	if (prompt.length < 2) {
		throw new RealtimeError(
			"UNIVERSAL_CHAT_SEARCH_EMPTY",
			"Enter a Torah search prompt first."
		);
	}
	return prompt;
}

/** Validates one bounded array of server-issued source ids. */
function selectionIds(value) {
	if (!Array.isArray(value) || value.length < 1 || value.length > 5) {
		throw new RealtimeError(
			"UNIVERSAL_CHAT_SELECTION_INVALID",
			"Choose between one and five retrieved sources."
		);
	}
	return [...new Set(
		value
			.map((id) => boundedText(id, "Source id", 100))
			.filter(Boolean)
	)];
}

module.exports = {
	APPLICATION_ID,
	CHANNEL_KINDS,
	EVENTS,
	TYPES,
	VERSION,
	boundedText,
	searchPrompt,
	selectionIds
};
