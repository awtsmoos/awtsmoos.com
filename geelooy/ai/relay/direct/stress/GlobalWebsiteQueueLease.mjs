// B"H
// Boruch Hashem
// Blessed is He

import { persistAcceptedTurn } from "./GlobalWebsiteQueueAcceptance.mjs";
import { queueError } from "./GlobalWebsiteQueuePolicy.mjs";

/**
 * @file Owns one website launch lease and every durable lifecycle transition.
 * @description
 * The Awtsmoos distinguishes a claim from an activated Send. Awtsmoos.com seals
 * delivery start before the click, permanent acceptance after the HTTP response,
 * uncertainty after ambiguous failure, and cooldown only after verified closure.
 */
export function publicWebsiteLease(queue, lease, queuedAt) {
	let released = false;
	return {
		markDeliveryStarted: receipt => transition(queue, lease, active => {
			active.phase = "delivery_started";
			active.deliveryStartedAt = Number(receipt?.startedAt || queue.now());
		}),
		markAccepted: receipt => persistAcceptedTurn(queue, lease, receipt),
		markReconciliationRequired: reason => transition(queue, lease, active => {
			active.phase = "reconciliation_required";
			active.reconciliationReason = String(reason || "unknown").slice(0, 256);
		}, true),
		release: options => releaseLease(
			queue,
			lease,
			options,
			() => released,
			value => { released = value; }
		),
		view: leaseView(queue, lease, queuedAt)
	};
}

async function transition(queue, lease, update, requireReconciliation = false) {
	return queue.store.mutate(state => {
		prepareState(state);
		const active = state.active.find(item => item.id === lease.id);
		if (!active) throw queueError("website_turn_lease_not_active");
		update(active);
		if (requireReconciliation) {
			state.reconciliationRequiredAt = state.reconciliationRequiredAt || queue.now();
		}
		return { ...active };
	});
}

async function releaseLease(queue, lease, options = {}, isReleased, setReleased) {
	if (isReleased()) return false;
	const closedAt = Number(options.closedAt || queue.now());
	queue.lastSnapshot = await queue.store.mutate(state => {
		prepareState(state);
		state.active = state.active.filter(item => item.id !== lease.id);
		if (options.uncertain && !state.accepted[lease.ticketId]) {
			state.uncertain[lease.ticketId] = uncertainReceipt(lease, options, queue.now());
		}
		if (options.startCooldown === true) {
			state.lastClosedAt = Math.max(Number(state.lastClosedAt || 0), closedAt);
			if (state.accepted[lease.ticketId]) {
				state.accepted[lease.ticketId].closedAt = closedAt;
			}
		}
		return queue.snapshot(state);
	});
	setReleased(true);
	return true;
}

function prepareState(state) {
	state.active = Array.isArray(state.active) ? state.active : [];
	state.accepted = state.accepted && typeof state.accepted === "object"
		? state.accepted
		: {};
	state.uncertain = state.uncertain && typeof state.uncertain === "object"
		? state.uncertain
		: {};
}

function uncertainReceipt(lease, options, now) {
	return {
		deliveryStartedAt: Number(lease.deliveryStartedAt || lease.acquiredAt || now),
		recordedAt: now,
		browserClosedAt: options.startCooldown ? Number(options.closedAt || now) : null,
		reason: String(options.reason || "submission_outcome_uncertain").slice(0, 256)
	};
}

function leaseView(queue, lease, queuedAt) {
	return {
		leaseId: lease.id,
		idempotencyKey: lease.idempotencyKey,
		queuedMs: Math.max(0, lease.acquiredAt - queuedAt),
		acquiredAt: new Date(lease.acquiredAt).toISOString(),
		minimumIntervalMs: queue.minimumIntervalMs,
		maxActiveTabs: 1,
		intervalAnchor: "verified-tab-close"
	};
}
