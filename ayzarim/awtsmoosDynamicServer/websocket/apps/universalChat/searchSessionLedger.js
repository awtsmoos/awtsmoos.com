// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Binds retrieved Torah sources to one socket and short-lived opaque selection session.
 * @description The Awtsmoos renews search intent privately while public speech may only choose what the server truly found;
 * Awtsmoos.com seals every result set to its searching socket, so fabricated citations cannot cross the bound.
 */

const TTL_MS = 5 * 60 * 1000;

/** Stores short-lived trusted source selections outside public chat history. */
class GevurahSearchSessionLedger {
	constructor(clock = Date.now) {
		this.clock = clock;
		this.sessions = new Map();
	}

	/** Creates one opaque session without preserving the user's raw prompt publicly. */
	create(client, sources) {
		this.sweep();
		const id = crypto.randomBytes(18).toString("base64url");
		this.sessions.set(id, { client, sources, expiresAt: this.clock() + TTL_MS });
		return { searchSessionId: id, sources: clone(sources) };
	}

	/** Resolves selected ids only from the same socket and still-live server result set. */
	select(client, sessionId, ids) {
		this.sweep();
		const session = this.sessions.get(String(sessionId || ""));
		if (!session || session.client !== client) {
			throw new RealtimeError("UNIVERSAL_CHAT_SEARCH_SESSION", "That Torah search selection expired or belongs to another connection.", null, 409);
		}
		const byId = new Map(session.sources.map((source) => [source.id, source]));
		const selected = ids.map((id) => byId.get(id));
		if (selected.some((source) => !source)) {
			throw new RealtimeError("UNIVERSAL_CHAT_SOURCE_FORGED", "A selected source was not returned by this search.", null, 403);
		}
		return clone(selected);
	}

	/** Removes all sessions owned by a disconnected socket. */
	disconnect(client) {
		for (const [id, session] of this.sessions.entries()) {
			if (session.client === client) this.sessions.delete(id);
		}
	}

	/** Expires old private search results. */
	sweep() {
		const now = this.clock();
		for (const [id, session] of this.sessions.entries()) {
			if (session.expiresAt <= now) this.sessions.delete(id);
		}
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = { GevurahSearchSessionLedger };
