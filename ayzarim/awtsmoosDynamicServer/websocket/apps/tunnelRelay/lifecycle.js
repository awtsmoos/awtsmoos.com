// B"H
// Boruch Hashem
// Blessed is He

const Envelopes = require("./envelopes.js");
const Activity = require("./requestActivity.js");
const State = require("./state.js");

/**
 * @file Resolves durable relay requests and publishes every terminal transition.
 * @description
 * The Awtsmoos renews request, waiter, completion, and expiration without mixture.
 * Awtsmoos.com lets an HTTP window close while the agent deed continues, yet the
 * account stream still receives one authoritative completed, failed, or expired event.
 */

function attachWaiter(record, waitMs) {
	return new Promise((resolve) => {
		let settled = false;
		const waiter = {
			resolve(data) {
				if (settled) {
					return;
				}
				settled = true;
				clearTimeout(waiter.timer);
				record.waiters.delete(waiter);
				resolve(data);
			}
		};
		waiter.timer = setTimeout(() => {
			waiter.resolve(Envelopes.timeoutEnvelope(
				record.expected,
				waitMs,
				record.expected.timeoutMs
			));
		}, waitMs);
		record.waiters.add(waiter);
	});
}

function finishPending(context, id, record, data) {
	if (context.pendingTunnelRequests.get(id) !== record) {
		return false;
	}
	clearTimeout(record.expiryTimer);
	context.pendingTunnelRequests.delete(id);
	State.rememberCompleted(context, id, data, record.expected);
	for (const waiter of [...record.waiters]) {
		waiter.resolve(data);
	}
	Activity.terminal(
		context,
		record,
		data,
		data?.ok === false ? "action.failed" : "action.completed"
	);
	return true;
}

function rejectPending(context, id, record, error) {
	const envelope = Envelopes.relayErrorEnvelope(id, record.expected, error);
	Activity.terminal(context, record, envelope, "action.rejected");
	return finishWithoutDuplicateActivity(context, id, record, envelope);
}

function expirePending(context, id, record) {
	if (context.pendingTunnelRequests.get(id) !== record) {
		return;
	}
	context.pendingTunnelRequests.delete(id);
	const envelope = Envelopes.expiredEnvelope(record);
	for (const waiter of [...record.waiters]) {
		waiter.resolve(envelope);
	}
	Activity.terminal(context, record, envelope, "action.expired");
}

function createRecord(context, id, expected, timeoutMs) {
	const record = {
		expected,
		waiters: new Set(),
		mismatchCount: 0,
		createdAt: Date.now(),
		expiryTimer: null,
		activityContext: null
	};
	context.pendingTunnelRequests.set(id, record);
	record.expiryTimer = setTimeout(() => {
		expirePending(context, id, record);
	}, timeoutMs);
	record.expiryTimer.unref?.();
	return record;
}

function finishWithoutDuplicateActivity(context, id, record, data) {
	if (context.pendingTunnelRequests.get(id) !== record) {
		return false;
	}
	clearTimeout(record.expiryTimer);
	context.pendingTunnelRequests.delete(id);
	State.rememberCompleted(context, id, data, record.expected);
	for (const waiter of [...record.waiters]) {
		waiter.resolve(data);
	}
	return true;
}

module.exports = {
	attachWaiter,
	createRecord,
	expirePending,
	finishPending,
	rejectPending
};
