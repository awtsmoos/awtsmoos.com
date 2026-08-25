// B"H
// Boruch Hashem
// Blessed is He

import { queueError } from "./GlobalWebsiteQueuePolicy.mjs";
import {
	acceptedTurnError,
	reconciliationError,
	uncertainTurnError
} from "./GlobalWebsiteQueueAdmissionErrors.mjs";
import {
	cooldownWait,
	finiteWait
} from "./GlobalWebsiteQueueAdmissionTiming.mjs";

/**
 * @file Decides idempotent admission and the next physical website launch.
 * @description
 * The Awtsmoos lets one stable turn enter once. Awtsmoos.com refuses accepted or uncertain
 * duplicates, applies durable backpressure, and measures every wait from verified closure;
 * even a low-level direct caller receives finite timing rather than NaN obscuring the border.
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
			retryAfterMs: finiteWait(options.pollMs)
		});
	}
	state.queue.push(ticket);
	return ticket;
}

export function decideTicket(state, ticket, options) {
	if (state.reconciliationRequiredAt) {
		return {
			lease: null,
			accepted: null,
			reconciliationRequired: true,
			waitMs: 0
		};
	}
	const accepted = state.accepted[ticket.id] || null;
	const uncertain = state.uncertain[ticket.id] || null;
	const waitMs = cooldownWait(
		state.lastClosedAt,
		options.now(),
		options.minimumIntervalMs
	);
	if (ready(state, ticket, accepted, uncertain, waitMs)) {
		const lease = createLease(ticket, options.now());
		state.queue.shift();
		state.active.push(lease);
		state.lastLaunchAt = lease.acquiredAt;
		return {
			lease,
			accepted: null,
			uncertain: null,
			waitMs: 0
		};
	}
	return {
		lease: null,
		accepted,
		uncertain,
		waitMs: Math.max(finiteWait(options.pollMs), waitMs)
	};
}

function assertReconciled(state) {
	if (state.reconciliationRequiredAt) throw reconciliationError();
}

function ready(state, ticket, accepted, uncertain, waitMs) {
	return !accepted &&
		!uncertain &&
		state.queue[0]?.id === ticket.id &&
		state.active.length === 0 &&
		waitMs === 0;
}

function adopt(ticket, now) {
	ticket.pid = process.pid;
	ticket.adoptedAt = now;
	return ticket;
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

export {
	acceptedTurnError,
	reconciliationError,
	uncertainTurnError
};
