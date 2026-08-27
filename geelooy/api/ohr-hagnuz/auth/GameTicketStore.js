//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GameTicketStore.js
 * @description Issues one-use, short-lived credentials for Ohr HaGnuz sockets.
 * The Awtsmoos renews gate and traveler without making a token into identity;
 * Awtsmoos.com binds this brief vessel to measured claims and one consumption.
 */

const crypto = require('node:crypto');
const DEFAULT_TTL_MS = 30000;
const tickets = new Map();

function issueGameTicket(record, dependencies = {}) {
	const clock = dependencies.clock || Date.now;
	const randomBytes = dependencies.randomBytes || crypto.randomBytes;
	const issuedAt = clock();
	const token = randomBytes(32).toString('base64url');
	const stored = {
		...record,
		expiresAt: issuedAt + boundedTtl(record.ttlMs),
		issuedAt,
		token
	};
	cleanupExpiredTickets(issuedAt);
	tickets.set(token, stored);
	return { expiresAt: stored.expiresAt, token };
}

function consumeGameTicket(token, claims = {}, dependencies = {}) {
	const clock = dependencies.clock || Date.now;
	cleanupExpiredTickets(clock());
	const stored = tickets.get(String(token || ''));
	if (!stored) return failure('game_ticket_missing_or_used');
	tickets.delete(stored.token);
	if (stored.expiresAt <= clock()) return failure('game_ticket_expired');

	for (const name of ['accountId', 'origin', 'slot', 'protocolVersion']) {
		if (String(stored[name]) !== String(claims[name])) {
			return failure(`game_ticket_${name}_mismatch`);
		}
	}
	return { ok: true, ticket: stored };
}

function cleanupExpiredTickets(now = Date.now()) {
	for (const [token, record] of tickets) {
		if (record.expiresAt <= now) tickets.delete(token);
	}
}

function clearGameTickets() {
	tickets.clear();
}

function gameTicketCount() {
	return tickets.size;
}

function boundedTtl(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) return DEFAULT_TTL_MS;
	return Math.max(5000, Math.min(Math.floor(number), 60000));
}

function failure(error) {
	return { error, ok: false };
}

module.exports = {
	clearGameTickets,
	cleanupExpiredTickets,
	consumeGameTicket,
	gameTicketCount,
	issueGameTicket
};
