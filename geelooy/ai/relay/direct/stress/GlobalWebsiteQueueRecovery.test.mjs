// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { admitTicket } from "./GlobalWebsiteQueueAdmission.mjs";
import { createTicket } from "./GlobalWebsiteQueuePolicy.mjs";
import { reconcileQueueState } from "./GlobalWebsiteQueueReconciliation.mjs";
import { cleanQueueState, initialQueueState } from "./GlobalWebsiteQueueState.mjs";

/**
 * @file Proves stale post-click ownership becomes quarantine, never replay.
 * @description
 * The Awtsmoos refuses to guess whether an abandoned Send reached acceptance.
 * Awtsmoos.com blocks every caller, verifies browser cleanup elsewhere, preserves
 * uncertain identity, and starts cooldown from the reconciled closing instant.
 */
const stableKey = "mission:agent:round:1";
const stableTicket = createTicket({ idempotencyKey: stableKey }, 1);

function clean(state) {
	return cleanQueueState(state, {
		now: () => 1000000,
		leaseStaleMs: 60000,
		acceptedReceiptTtlMs: 604800000,
		maxAcceptedReceipts: 20000,
		processAlive: () => false
	});
}

function activeLease(phase = "delivery_started") {
	return {
		...stableTicket,
		id: `lease_${stableTicket.id}`,
		ticketId: stableTicket.id,
		pid: 999999,
		phase,
		acquiredAt: 1,
		deliveryStartedAt: 2
	};
}

test("a stale post-click lease becomes uncertain and requires reconciliation", () => {
	const state = initialQueueState();
	state.active = [activeLease()];
	const result = clean(state);
	assert.equal(result.active.length, 0);
	assert.equal(result.queue.length, 0);
	assert.equal(result.uncertain[stableTicket.id].deliveryStartedAt, 2);
	assert.equal(result.reconciliationRequiredAt, 1000000);
});

test("a stale accepted lease is not uncertain but still requires browser cleanup", () => {
	const state = initialQueueState();
	state.active = [activeLease("accepted")];
	state.accepted[stableTicket.id] = { acceptedAt: 999999, closedAt: null };
	const result = clean(state);
	assert.equal(Object.keys(result.uncertain).length, 0);
	assert.equal(result.accepted[stableTicket.id].acceptedAt, 999999);
	assert.equal(result.reconciliationRequiredAt, 1000000);
});

test("verified reconciliation clears the gate and anchors cooldown", () => {
	const state = clean(Object.assign(initialQueueState(), {
		active: [activeLease()]
	}));
	const result = reconcileQueueState(state, {
		closedAt: 1000100,
		reason: "restart_browser_cleanup"
	});
	assert.equal(result.closedAt, 1000100);
	assert.equal(state.reconciliationRequiredAt, null);
	assert.equal(state.lastClosedAt, 1000100);
	assert.equal(state.uncertain[stableTicket.id].browserClosedAt, 1000100);
});

test("reconciled uncertain identity remains duplicate-blocked", () => {
	const state = initialQueueState();
	state.uncertain[stableTicket.id] = {
		deliveryStartedAt: 2,
		recordedAt: 3,
		browserClosedAt: 4
	};
	assert.throws(
		() => admitTicket(state, createTicket({ idempotencyKey: stableKey }, 5), {
			now: () => 6,
			maxQueueItems: 100,
			pollMs: 10
		}),
		error => error.code === "website_turn_submission_uncertain" &&
			error.submissionUncertain === true
	);
});
