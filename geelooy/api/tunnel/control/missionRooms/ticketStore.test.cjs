// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	clearTickets,
	consumeTicket,
	issueTicket,
	ticketCount
} = require("./ticketStore.js");

/**
 * @file Proves mission-room tickets are one-use and consume on identity mismatch.
 * @description
 * The Awtsmoos renews gate and traveler without letting a stolen token try again.
 * Awtsmoos.com destroys each ticket at first consumption, whether claims match or
 * fail, so replay and iterative account/session guessing cannot reopen the room.
 */

test("consumes mismatched ticket and rejects replay", () => {
	clearTickets();
	const issued = issueTicket(ticketRecord());
	const mismatch = consumeTicket(issued.token, claims({
		sessionId: "wrong-session"
	}));
	assert.equal(mismatch.ok, false);
	assert.equal(mismatch.error, "ticket_sessionId_mismatch");
	assert.equal(ticketCount(), 0);
	const replay = consumeTicket(issued.token, claims());
	assert.equal(replay.ok, false);
	assert.equal(replay.error, "ticket_missing_or_used");
});

test("accepts exact claims once", () => {
	clearTickets();
	const issued = issueTicket(ticketRecord());
	const first = consumeTicket(issued.token, claims());
	assert.equal(first.ok, true);
	assert.equal(first.ticket.tunnelId, "tun_a");
	const second = consumeTicket(issued.token, claims());
	assert.equal(second.ok, false);
	assert.equal(second.error, "ticket_missing_or_used");
});

function ticketRecord() {
	return {
		origin: "https://awtsmoos.com",
		accountId: "account-b",
		sessionId: "session-b",
		tunnelId: "tun_a",
		tunnelName: "alpha",
		missionId: "mission-a",
		protocolVersion: 1,
		permissionVersion: 4,
		revocationVersion: 2,
		ttlMs: 20000
	};
}

function claims(patch = {}) {
	return {
		origin: "https://awtsmoos.com",
		accountId: "account-b",
		sessionId: "session-b",
		tunnelName: "alpha",
		missionId: "mission-a",
		protocolVersion: 1,
		...patch
	};
}
