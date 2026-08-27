// B"H
// Boruch Hashem
// Blessed is He

import { queueError } from "./GlobalWebsiteQueuePolicy.mjs";

/**
 * @file Decides idempotent admission and the next physical website launch.
 * @description
 * The Awtsmoos lets one stable turn enter once. Awtsmoos.com refuses accepted or
 * uncertain duplicates, applies durable backpressure, and halts every caller until
 * abandoned browser delivery has been reconciled and its verified close persisted.
 */
export function admitTicket(state, ticket, options) {
	assertReconciled(state);
	if (state.accepted[ticket.id]) throw acceptedTurnError(state.accepted[ticket.id]);
	if (state.uncertain[ticket.id]) throw uncertainTurnError(state.uncertain[ticket.id]);
	if (state.active.some(item => item.ticketId === ticket.id)) {
		throw queueError("website_turn_idempotency_inflight");
	}
	const queued = state.queue.find(item => item.id === ticket.id);
	if (queued) return adopt(queued, options.now());
	const durableCount = state.queue.length + Object.keys(state.uncertain).length;
	if (durableCount >= options.maxQueueItems) {
		throw queueError("website_turn_queue_backpressure", {
			queued: state.queue.length,
			uncertain: Object.keys(state.uncertain).length,
			maxQueueItems: options.maxQueueItems,
			retryAfterMs: options.pollMs
		});
	}
	state.queue.push(ticket);
	return ticket;
}

export function decideTicket(state, ticket, options) {
	if (state.reconciliationRequiredAt) {
		return { lease: null, accepted: null, reconciliationRequired: true, waitMs: 0 };
	}
	const accepted = state.accepted[ticket.id] || null;
	const uncertain = state.uncertain[ticket.id] || null;
	const now = options.now();
	const waitMs = cooldownWait(state.lastClosedAt, now, options.minimumIntervalMs);
	if (!accepted && !uncertain && state.queue[0]?.id === ticket.id &&
		state.active.length === 0 && waitMs === 0) {
		const lease = createLease(ticket, now);
		state.queue.shift();
		state.active.push(lease);
		state.lastLaunchAt = now;
		return { lease, accepted: null, uncertain: null, waitMs: 0 };
	}
	return {
		lease: null,
		accepted,
		uncertain,
		waitMs: Math.max(options.pollMs, waitMs)
	};
}

export function acceptedTurnError(receipt) {
	return queueError("website_turn_already_accepted", {
		submissionAccepted: true,
		acceptedReceipt: receipt
	});
}

export function uncertainTurnError(receipt) {
	return queueError("website_turn_submission_uncertain", {
		submissionUncertain: true,
		uncertainReceipt: receipt
	});
}

export function reconciliationError() {
	return queueError("website_turn_reconciliation_required", {
		reconciliationRequired: true
	});
}

function assertReconciled(state) {
	if (state.reconciliationRequiredAt) throw reconciliationError();
}

function adopt(ticket, now) {
	ticket.pid = process.pid;
	ticket.adoptedAt = now;
	return ticket;
}

function cooldownWait(lastClosedAt, now, minimumIntervalMs) {
	return lastClosedAt
		? Math.max(0, minimumIntervalMs - (now - lastClosedAt))
		: 0;
}

function createLease(ticket, now) {
	return {
		...ticket,
		id: `lease_${ticket.id}`,
		ticketId: ticket.id,
		pid: process.pid,
		phase: "claimed",
		acquiredAt: now
	};
}
