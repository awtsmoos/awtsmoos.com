// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Places small sliding-window bounds around Torah search and public publication requests.
 * @description The Awtsmoos renews abundance while Gevurah gives each request a measured pace in light;
 * Awtsmoos.com keeps retrieval useful without allowing one connection to drown the shared conversation from sight.
 */

const RULES = Object.freeze({
	search: { limit: 6, windowMs: 30000 },
	publish: { limit: 10, windowMs: 30000 }
});

/** Tracks short-lived request timestamps independently for each socket and action family. */
class GevurahUniversalChatRateLimiter {
	constructor(clock = Date.now) {
		this.clock = clock;
		this.clients = new Map();
	}

	/** Accepts one action or throws a structured 429 response when its window is full. */
	consume(client, action) {
		const rule = RULES[action];
		if (!rule) {
			return;
		}
		const now = this.clock();
		const state = this.clients.get(client) || {};
		const recent = (state[action] || []).filter((time) => now - time < rule.windowMs);
		if (recent.length >= rule.limit) {
			throw new RealtimeError(
				"UNIVERSAL_CHAT_RATE_LIMIT",
				"Please wait before trying that chat action again.",
				null,
				429
			);
		}
		recent.push(now);
		state[action] = recent;
		this.clients.set(client, state);
	}

	/** Forgets one disconnected socket's ephemeral rate windows. */
	disconnect(client) {
		this.clients.delete(client);
	}
}

module.exports = {
	GevurahUniversalChatRateLimiter
};
