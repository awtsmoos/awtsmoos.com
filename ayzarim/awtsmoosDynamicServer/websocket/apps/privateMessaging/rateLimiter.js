// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");

/** @file Applies different rates to conversation speech, social requests, and group creation. */

const RULES = Object.freeze({
	message: { limit: 45, windowMs: 30000 },
	request: { limit: 8, windowMs: 60000 },
	group: { limit: 4, windowMs: 60000 }
});

class GevurahPrivateMessagingRateLimiter {
	constructor(clock = Date.now) {
		this.clock = clock;
		this.clients = new Map();
	}

	consume(client, action) {
		const rule = RULES[action];
		if (!rule) return;
		const now = this.clock();
		const state = this.clients.get(client) || {};
		const recent = (state[action] || []).filter((time) => now - time < rule.windowMs);
		if (recent.length >= rule.limit) {
			throw new RealtimeError("PRIVATE_MESSAGING_RATE_LIMIT", "Please wait before trying that messaging action again.", null, 429);
		}
		recent.push(now);
		state[action] = recent;
		this.clients.set(client, state);
	}

	disconnect(client) {
		this.clients.delete(client);
	}
}

module.exports = { GevurahPrivateMessagingRateLimiter };
