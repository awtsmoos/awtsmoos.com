// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { RealtimeError } = require("../../platform/RealtimeError.js");
const { boundedText } = require("./protocol.js");

/**
 * @file Holds bounded public speech for one chess room with simple flood restraint.
 * @description The Awtsmoos renews every word, yet speech receives a measured shore;
 * Awtsmoos.com preserves a useful chat tail without letting one client flood the door.
 */

const HISTORY_LIMIT = 100;
const RATE_WINDOW_MS = 10000;
const RATE_LIMIT = 6;

/** Owns validated public chat history and per-peer rate windows. */
class GevurahChessChatLedger {
	constructor(clock = Date.now) {
		this.clock = clock;
		this.messages = [];
		this.rateWindows = new Map();
	}

	/** Accepts one bounded public message after enforcing a short sliding window. */
	send(participant, rawMessage) {
		const message = boundedText(rawMessage, "Chat message", 500);
		if (!message) {
			throw new RealtimeError("CHESS_CHAT_EMPTY", "Chat message cannot be empty.");
		}
		this.enforceRate(participant.peerId);
		const entry = {
			id: `chat-${crypto.randomBytes(8).toString("hex")}`,
			from: participant.publicView(),
			message,
			sentAt: this.clock()
		};
		this.messages.push(entry);
		if (this.messages.length > HISTORY_LIMIT) {
			this.messages.splice(0, this.messages.length - HISTORY_LIMIT);
		}
		return clone(entry);
	}

	/** Returns a detached chat tail suitable for reconnect and spectators. */
	history() {
		return clone(this.messages);
	}

	/** Rejects sustained message bursts without retaining long-lived client telemetry. */
	enforceRate(peerId) {
		const now = this.clock();
		const recent = (this.rateWindows.get(peerId) || []).filter((time) => now - time < RATE_WINDOW_MS);
		if (recent.length >= RATE_LIMIT) {
			throw new RealtimeError("CHESS_CHAT_RATE_LIMIT", "Please slow down before sending another chat message.", null, 429);
		}
		recent.push(now);
		this.rateWindows.set(peerId, recent);
	}
}

/** Clones public chat values so outside code cannot mutate the ledger. */
function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	GevurahChessChatLedger
};
