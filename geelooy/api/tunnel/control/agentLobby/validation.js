// B"H
"use strict";

/**
 * @file Guard the words and identities entering the shared Awtsmoos lobby.
 * @description Every shliach has a voice, yet a claimed name is not a proof
 * of identity; only the authenticated account gives access to the room.
 */
function requiredText(value, name, maximum) {
	if (typeof value !== "string" || !value.trim() || value.length > maximum) {
		const error = new Error("invalid_" + name);
		error.code = "AGENT_LOBBY_INVALID_" + name.toUpperCase();
		throw error;
	}
	return value.trim();
}

function session(value) {
	const candidate = requiredText(value, "session", 120);
	if (!/^[a-zA-Z0-9:._-]+$/.test(candidate)) throw new Error("invalid_session");
	return candidate;
}

function displayName(value) {
	return requiredText(value, "display_name", 80);
}

function message(value) {
	return requiredText(value, "message", 2400);
}

function messageId(value) {
	const id = requiredText(value, "message_id", 120);
	if (!/^[a-zA-Z0-9:._-]+$/.test(id)) throw new Error("invalid_message_id");
	return id;
}

function kind(value) {
	const chosen = String(value || "chat");
	if (!["chat", "intent", "conflict", "handoff", "notice"].includes(chosen)) {
		throw new Error("invalid_message_kind");
	}
	return chosen;
}

module.exports = { displayName, kind, message, messageId, session };
