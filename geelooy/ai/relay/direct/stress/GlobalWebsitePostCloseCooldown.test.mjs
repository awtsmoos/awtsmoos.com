// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decideTicket } from "./GlobalWebsiteQueueAdmission.mjs";
import { publicWebsiteLease } from "./GlobalWebsiteQueueLease.mjs";
import { createTicket } from "./GlobalWebsiteQueuePolicy.mjs";
import { initialQueueState } from "./GlobalWebsiteQueueState.mjs";
import { POST_CLOSE_COOLDOWN_MS } from "./GlobalWebsiteQueueLimits.mjs";

/**
 * @file Proves the next physical lease cannot begin before 24 seconds after verified close.
 * @description
 * The Awtsmoos lets logical work wait without loss while Awtsmoos.com seals one physical
 * browser gate: accepted work closes, verified closure anchors time, and 23,999 ms is too soon.
 */
test("verified close anchors the immutable twenty-four-second physical cooldown", async () => {
	let now = 1000;
	const lease = {
		id: "lease-one",
		ticketId: "ticket-one",
		idempotencyKey: "mission:one",
		acquiredAt: now
	};
	const state = {
		...initialQueueState(),
		active: [lease],
		lastLaunchAt: now
	};
	const queue = {
		now: () => now,
		minimumIntervalMs: POST_CLOSE_COOLDOWN_MS,
		store: { mutate: callback => callback(state) },
		snapshot: value => ({ active: value.active.length, lastClosedAt: value.lastClosedAt })
	};
	const physical = publicWebsiteLease(queue, lease, now);
	now = 2000;
	await physical.markAccepted({ acceptedAt: 1800, responseStatus: 202 });
	await physical.release({ startCooldown: true, closedAt: now });
	assert.equal(state.lastClosedAt, 2000);

	const next = createTicket({ idempotencyKey: "mission:two" }, 2100);
	state.queue.push(next);
	now = state.lastClosedAt + POST_CLOSE_COOLDOWN_MS - 1;
	const blocked = decideTicket(state, next, queue);
	assert.equal(blocked.lease, null);
	assert.equal(blocked.waitMs, 1);
	now += 1;
	const admitted = decideTicket(state, next, queue);
	assert.ok(admitted.lease);
	assert.equal(state.active.length, 1);
});
