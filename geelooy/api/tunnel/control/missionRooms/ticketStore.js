// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Stores one-use mission-room tickets bound to account and room intent.
 * @description
 * The Awtsmoos renews gate and traveler each instant. Awtsmoos.com makes a token
 * a brief account/session/origin covenant; immutable tunnel and permission records
 * remain inside the ticket and are re-authorized server-side when the gate opens.
 */

const tickets = new Map();
const DEFAULT_TTL_MS = 20000;
const CLAIM_BINDINGS = Object.freeze([
	"origin",
	"accountId",
	"sessionId",
	"tunnelName",
	"missionId",
	"protocolVersion"
]);

function issueTicket(record, dependencies = {}) {
	const clock = dependencies.clock || Date.now;
	const randomBytes = dependencies.randomBytes || crypto.randomBytes;
	const issuedAt = clock();
	const token = randomBytes(32).toString("base64url");
	const stored = {
		...record,
		token,
		issuedAt,
		expiresAt: issuedAt + boundedTtl(record.ttlMs)
	};
	cleanupExpired(issuedAt);
	tickets.set(token, stored);
	return { token, expiresAt: stored.expiresAt };
}

function consumeTicket(token, claims = {}, dependencies = {}) {
	const clock = dependencies.clock || Date.now;
	cleanupExpired(clock());
	const stored = tickets.get(String(token || ""));
	if (!stored) {
		return failure("ticket_missing_or_used");
	}
	tickets.delete(stored.token);
	if (stored.expiresAt <= clock()) {
		return failure("ticket_expired");
	}
	for (const name of CLAIM_BINDINGS) {
		const expected = name === "protocolVersion"
			? Number(claims[name])
			: String(claims[name] || "");
		if (stored[name] !== expected) {
			return failure(`ticket_${name}_mismatch`);
		}
	}
	return { ok: true, ticket: stored };
}

function cleanupExpired(now = Date.now()) {
	for (const [token, record] of tickets) {
		if (record.expiresAt <= now) {
			tickets.delete(token);
		}
	}
}

function clearTickets() {
	tickets.clear();
}

function ticketCount() {
	return tickets.size;
}

function boundedTtl(value) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(5000, Math.min(Math.floor(number), 60000))
		: DEFAULT_TTL_MS;
}

function failure(error) {
	return { ok: false, error };
}

module.exports = {
	CLAIM_BINDINGS,
	clearTickets,
	cleanupExpired,
	consumeTicket,
	issueTicket,
	ticketCount
};
