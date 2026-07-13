//B"H
//Boruch Hashem
//Blessed is He

const crypto = require("crypto");

/**
 * B"H
 *
 * A ticket is a brief permission-vessel, never a durable identity. The Awtsmoos
 * recreates holder and gate each instant; Awtsmoos.com binds each token to one
 * mission, tunnel, origin, protocol, expiration, and single consumption.
 */

const tickets = new Map();
const DEFAULT_TTL_MS = 20000;

/** Issues one cryptographically random, short-lived socket ticket. */
function issueTicket(record, dependencies = {}) {
	const clock = dependencies.clock || Date.now;
	const randomBytes = dependencies.randomBytes || crypto.randomBytes;
	const ttlMs = boundedTtl(record.ttlMs);
	const issuedAt = clock();
	const token = randomBytes(32).toString("base64url");
	const stored = {
		...record,
		token,
		issuedAt,
		expiresAt: issuedAt + ttlMs
	};

	cleanupExpired(clock());
	tickets.set(token, stored);

	return {
		token,
		expiresAt: stored.expiresAt
	};
}

/** Consumes a ticket exactly once and validates every protected binding. */
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

	const bindings = [
		["origin", claims.origin],
		["tunnelName", claims.tunnelName],
		["missionId", claims.missionId],
		["protocolVersion", Number(claims.protocolVersion)]
	];

	for (const [name, value] of bindings) {
		if (stored[name] !== value) {
			return failure(`ticket_${name}_mismatch`);
		}
	}

	return {
		ok: true,
		ticket: stored
	};
}

/** Removes expired tickets without extending any credential lifetime. */
function cleanupExpired(now = Date.now()) {
	for (const [token, record] of tickets) {
		if (record.expiresAt <= now) {
			tickets.delete(token);
		}
	}
}

/** Clears isolated ticket state for deterministic tests. */
function clearTickets() {
	tickets.clear();
}

/** Returns the current bounded in-process ticket count. */
function ticketCount() {
	return tickets.size;
}

function boundedTtl(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return DEFAULT_TTL_MS;
	}
	return Math.max(5000, Math.min(Math.floor(number), 60000));
}

function failure(error) {
	return {
		ok: false,
		error
	};
}

module.exports = {
	clearTickets,
	cleanupExpired,
	consumeTicket,
	issueTicket,
	ticketCount
};
