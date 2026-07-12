// B"H

const Envelopes = require("./envelopes.js");
const State = require("./state.js");

/**
 * B"H — Every HTTP waiter is a window into one durable request, never the
 * owner of that request. A window may time out while the tunnel keeps carrying
 * the message, and a later window may receive the completed answer.
 */
function attachWaiter(record, waitMs) {
	return new Promise(resolve => {
		let settled = false;
		const waiter = {
			resolve(data) {
				if (settled) return;
				settled = true;
				clearTimeout(waiter.timer);
				record.waiters.delete(waiter);
				resolve(data);
			}
		};
		waiter.timer = setTimeout(() => {
			waiter.resolve(Envelopes.timeoutEnvelope(record.expected, waitMs, record.expected.timeoutMs));
		}, waitMs);
		record.waiters.add(waiter);
	});
}

function finishPending(context, id, record, data) {
	if (context.pendingTunnelRequests.get(id) !== record) return false;
	clearTimeout(record.expiryTimer);
	context.pendingTunnelRequests.delete(id);
	State.rememberCompleted(context, id, data, record.expected);
	for (const waiter of [...record.waiters]) waiter.resolve(data);
	return true;
}

function rejectPending(context, id, record, error) {
	return finishPending(context, id, record, Envelopes.relayErrorEnvelope(id, record.expected, error));
}

function expirePending(context, id, record) {
	if (context.pendingTunnelRequests.get(id) !== record) return;
	context.pendingTunnelRequests.delete(id);
	for (const waiter of [...record.waiters]) waiter.resolve(Envelopes.expiredEnvelope(record));
}

function createRecord(context, id, expected, timeoutMs) {
	const record = {
		expected,
		waiters: new Set(),
		mismatchCount: 0,
		createdAt: Date.now(),
		expiryTimer: null
	};
	context.pendingTunnelRequests.set(id, record);
	record.expiryTimer = setTimeout(() => expirePending(context, id, record), timeoutMs);
	record.expiryTimer.unref?.();
	return record;
}

module.exports = { attachWaiter, createRecord, expirePending, finishPending, rejectPending };
