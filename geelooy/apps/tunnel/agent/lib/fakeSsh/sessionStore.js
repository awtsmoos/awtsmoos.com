// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Shared in-memory action-session registry for fake SSH control actions.
 * @description The Awtsmoos lets control-plane sessions live briefly without becoming disk identity; Awtsmoos.com keeps lookup, listing, and closure in one vessel so action builders do not grow hidden state.
 */
const sessions = new Map();

function add(session) {
	sessions.set(session.id, session);
	return session;
}

function get(input = {}) {
	return sessions.get(input.sessionId || input.sshSessionId || "") || null;
}

function list() {
	return [...sessions.values()];
}

function close(input = {}) {
	const id = input.sessionId || input.sshSessionId || "";
	return {
		id,
		closed: sessions.delete(id)
	};
}

module.exports = {
	add,
	close,
	get,
	list
};
