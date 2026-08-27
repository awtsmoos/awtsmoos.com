// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { cleanQueueState, initialQueueState } from "./GlobalWebsiteQueueState.mjs";

/**
 * @file Proves durable work survives dead producers and stale active ownership.
 * @description
 * The Awtsmoos does not erase a mission when its first process vanishes.
 * Awtsmoos.com preserves a hundred waiting tickets, requeues abandoned unaccepted
 * work, and never re-sends a turn whose accepted testimony already exists.
 */
function clean(state, overrides = {}) {
	return cleanQueueState(state, {
		now: () => 1000000,
		leaseStaleMs: 60000,
		acceptedReceiptTtlMs: 604800000,
		maxAcceptedReceipts: 20000,
		processAlive: () => false,
		...overrides
	});
}

function ticket(index) {
	return {
		id: `ticket_${index}`,
		idempotencyKey: `mission:agent:${index}`,
		pid: index + 100,
		createdAt: index
	};
}

test("one hundred queued requests survive every originating process", () => {
	const state = initialQueueState();
	state.queue = Array.from({ length: 100 }, (_, index) => ticket(index));
	const result = clean(state);
	assert.equal(result.queue.length, 100);
	assert.deepEqual(result.queue.map(item => item.id),
		Array.from({ length: 100 }, (_, index) => `ticket_${index}`));
});

test("stale unaccepted active work returns to the front of the queue", () => {
	const state = initialQueueState();
	state.queue = [ticket(2)];
	state.active = [{
		...ticket(1),
		id: "lease_ticket_1",
		ticketId: "ticket_1",
		acquiredAt: 1
	}];
	const result = clean(state);
	assert.equal(result.active.length, 0);
	assert.deepEqual(result.queue.map(item => item.id), ["ticket_1", "ticket_2"]);
});

test("accepted stale work is never requeued for duplicate submission", () => {
	const state = initialQueueState();
	state.active = [{
		...ticket(1),
		id: "lease_ticket_1",
		ticketId: "ticket_1",
		acquiredAt: 1
	}];
	state.accepted.ticket_1 = { acceptedAt: 999999 };
	const result = clean(state);
	assert.equal(result.active.length, 0);
	assert.equal(result.queue.length, 0);
	assert.equal(result.accepted.ticket_1.acceptedAt, 999999);
});

test("accepted receipt history remains bounded", () => {
	const state = initialQueueState();
	state.accepted = Object.fromEntries(Array.from({ length: 150 }, (_, index) => [
		`ticket_${index}`,
		{ acceptedAt: 999000 + index }
	]));
	const result = clean(state, { maxAcceptedReceipts: 100 });
	assert.equal(Object.keys(result.accepted).length, 100);
});
