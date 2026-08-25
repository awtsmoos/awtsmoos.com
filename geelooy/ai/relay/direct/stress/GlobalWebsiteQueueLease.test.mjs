// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { publicWebsiteLease } from "./GlobalWebsiteQueueLease.mjs";
import { POST_CLOSE_COOLDOWN_MS } from "./GlobalWebsiteQueueLimits.mjs";

/**
 * @file Proves acceptance and release remain durable and retry-safe.
 * @description
 * The Awtsmoos does not confuse an in-memory promise with a written transition.
 * Awtsmoos.com lets a failed release try again, records accepted testimony before
 * closure, and anchors the twenty-four-second gate only after durable close agrees.
 */
function stateFor(lease) {
	return {
		queue: [],
		active: [lease],
		accepted: {},
		lastLaunchAt: lease.acquiredAt,
		lastClosedAt: null
	};
}

function queueWithMutator(mutator) {
	return {
		now: () => 2000,
		minimumIntervalMs: POST_CLOSE_COOLDOWN_MS,
		lastSnapshot: null,
		store: { mutate: mutator },
		snapshot: state => ({
			active: state.active.length,
			lastClosedAt: state.lastClosedAt
		})
	};
}

const lease = {
	id: "lease_ticket_one",
	ticketId: "ticket_one",
	idempotencyKey: "mission:agent:round:1",
	acquiredAt: 1000
};

test("acceptance is persisted under the stable ticket identity", async () => {
	const state = stateFor(lease);
	const queue = queueWithMutator(callback => callback(state));
	const publicLease = publicWebsiteLease(queue, lease, 900);
	await publicLease.markAccepted({
		acceptedAt: 1500,
		conversationId: "opaque-conversation",
		responseStatus: 200
	});
	assert.equal(state.accepted.ticket_one.acceptedAt, 1500);
	assert.equal(state.active[0].acceptedAt, 1500);
});

test("a failed durable release remains retryable", async () => {
	const state = stateFor(lease);
	let attempts = 0;
	const queue = queueWithMutator(callback => {
		attempts += 1;
		if (attempts === 1) throw new Error("disk_write_failed");
		return callback(state);
	});
	const publicLease = publicWebsiteLease(queue, lease, 900);
	await assert.rejects(
		publicLease.release({ startCooldown: true, closedAt: 1800 }),
		/disk_write_failed/
	);
	assert.equal(await publicLease.release({ startCooldown: true, closedAt: 1900 }), true);
	assert.equal(attempts, 2);
	assert.equal(state.active.length, 0);
	assert.equal(state.lastClosedAt, 1900);
});

test("a second successful release is idempotent", async () => {
	const state = stateFor(lease);
	const queue = queueWithMutator(callback => callback(state));
	const publicLease = publicWebsiteLease(queue, lease, 900);
	assert.equal(await publicLease.release({ startCooldown: false }), true);
	assert.equal(await publicLease.release({ startCooldown: false }), false);
});
