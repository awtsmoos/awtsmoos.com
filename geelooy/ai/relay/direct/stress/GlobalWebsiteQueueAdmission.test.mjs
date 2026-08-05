// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { admitTicket, decideTicket } from "./GlobalWebsiteQueueAdmission.mjs";
import { createTicket } from "./GlobalWebsiteQueuePolicy.mjs";
import { initialQueueState } from "./GlobalWebsiteQueueState.mjs";

/**
 * @file Proves idempotent admission, backpressure, and one-lane launch decisions.
 * @description
 * The Awtsmoos admits a durable multitude without duplicate fire. Awtsmoos.com
 * adopts an existing stable ticket, refuses accepted testimony, and reveals one
 * physical lease only when the queue head, active lane, and cooldown all agree.
 */
const options = {
	now: () => 1000,
	maxQueueItems: 100,
	pollMs: 25,
	minimumIntervalMs: 18000
};

function ticket(key) {
	return createTicket({ idempotencyKey: key }, 10);
}

test("an existing stable ticket is adopted instead of duplicated", () => {
	const state = initialQueueState();
	const first = ticket("mission:agent:1");
	state.queue.push({ ...first, pid: 999 });
	const adopted = admitTicket(state, ticket("mission:agent:1"), options);
	assert.equal(state.queue.length, 1);
	assert.equal(adopted.id, first.id);
	assert.equal(adopted.pid, process.pid);
});

test("accepted testimony refuses duplicate admission", () => {
	const state = initialQueueState();
	const turn = ticket("mission:agent:2");
	state.accepted[turn.id] = { acceptedAt: 900 };
	assert.throws(
		() => admitTicket(state, turn, options),
		error => error.code === "website_turn_already_accepted" &&
			error.submissionAccepted === true
	);
});

test("hard backpressure reports capacity without dropping queued work", () => {
	const state = initialQueueState();
	state.queue = Array.from({ length: 100 }, (_, index) => ticket(`queued:${index}`));
	assert.throws(
		() => admitTicket(state, ticket("overflow"), options),
		error => error.code === "website_turn_queue_backpressure" &&
			error.queued === 100 && error.maxQueueItems === 100
	);
	assert.equal(state.queue.length, 100);
});

test("only the first waiting turn enters the one physical lane", () => {
	const state = initialQueueState();
	const first = ticket("first");
	const second = ticket("second");
	state.queue.push(first, second);
	assert.equal(decideTicket(state, second, options).lease, null);
	const decision = decideTicket(state, first, options);
	assert.equal(decision.lease.ticketId, first.id);
	assert.equal(state.active.length, 1);
	assert.deepEqual(state.queue.map(item => item.id), [second.id]);
});

test("verified-close cooldown blocks the next opening", () => {
	const state = initialQueueState();
	const next = ticket("next");
	state.queue.push(next);
	state.lastClosedAt = 999;
	const decision = decideTicket(state, next, options);
	assert.equal(decision.lease, null);
	assert.equal(decision.waitMs, 17999);
});
