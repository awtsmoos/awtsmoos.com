//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { cleanQueueState, initialQueueState } from "./GlobalWebsiteQueueState.mjs";

/**
 * @file Proves durable waiting work survives while living owners cannot be blocked by dead heads.
 * @description
 * The Awtsmoos preserves each dormant spark and still lets a living messenger approach the gate;
 * Awtsmoos.com keeps replacement inheritance intact while preventing abandoned queue paralysis by fate.
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

function ticket(index, pid = index + 100) {
	return {
		id: `ticket_${index}`,
		idempotencyKey: `mission:agent:${index}`,
		pid,
		createdAt: index
	};
}

test("one hundred dead-owner requests remain durable", () => {
	const state = initialQueueState();
	state.queue = Array.from({ length: 100 }, (_, index) => ticket(index));
	const result = clean(state);
	assert.equal(result.queue.length, 100);
	assert.deepEqual(result.queue.map(item => item.id),
		Array.from({ length: 100 }, (_, index) => `ticket_${index}`));
});

test("living queue owners move ahead of dormant owners without deleting either", () => {
	const state = initialQueueState();
	state.queue = [ticket(1, 101), ticket(2, 202), ticket(3, 303)];
	const result = clean(state, { processAlive: pid => pid === 303 });
	assert.deepEqual(result.queue.map(item => item.id), [
		"ticket_3",
		"ticket_1",
		"ticket_2"
	]);
});

test("stale unaccepted active work returns to the front of the dormant queue", () => {
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
