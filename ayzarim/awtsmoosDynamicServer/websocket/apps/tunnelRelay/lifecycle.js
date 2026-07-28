// B"H
// Boruch Hashem
// Blessed is He

const Envelopes = require("./envelopes.js");
const Finalization = require("./lifecycleFinalization.js");

/**
 * @file Owns one relay request from reservation through durable release.
 * @description
 * The Awtsmoos gathers many waiting callers around one canonical deed.
 * Awtsmoos.com keeps them joined until terminal persistence is verified and lets
 * each HTTP wait window close without erasing or repeating the native operation.
 */
function attachWaiter(record, waitMs) {
	if (record.finalizationPromise) {
		return record.finalizationPromise.then(() => record.finalData);
	}
	return new Promise(resolve => {
		let active = true;
		const waiter = {
			timer: null,
			resolve(data) {
				if (!active) return;
				active = false;
				clearTimeout(waiter.timer);
				record.waiters.delete(waiter);
				resolve(data);
			}
		};
		record.waiters.add(waiter);
		waiter.timer = setTimeout(() => {
			waiter.resolve(Envelopes.timeoutEnvelope(
				record.expected,
				waitMs,
				record.totalTimeoutMs
			));
		}, waitMs);
		waiter.timer.unref?.();
	});
}

function createRecord(context, id, expected, totalTimeoutMs) {
	const record = {
		expected,
		waiters: new Set(),
		totalTimeoutMs,
		expiryTimer: null,
		acceptanceTimer: null,
		consumerTimer: null,
		finalizationPromise: null,
		finalData: null,
		mismatchCount: 0,
		createdAt: Date.now(),
		activityContext: null
	};
	context.pendingTunnelRequests.set(id, record);
	record.expiryTimer = setTimeout(() => {
		void expirePending(context, id, record);
	}, totalTimeoutMs);
	record.expiryTimer.unref?.();
	return record;
}

async function finishPending(context, id, record, data) {
	record.finalData = data;
	return await Finalization.finish(context, id, record, data, {
		mode: "completed",
		eventName: data?.ok === false ? "action.failed" : "action.completed"
	});
}

async function rejectPending(context, id, record, error) {
	const data = Envelopes.relayErrorEnvelope(id, record.expected, error);
	record.finalData = data;
	return await Finalization.finish(context, id, record, data, {
		mode: "completed",
		eventName: "action.rejected"
	});
}

async function expirePending(context, id, record) {
	if (context.pendingTunnelRequests.get(id) !== record) return false;
	const data = Envelopes.expiredEnvelope(record);
	record.finalData = data;
	return await Finalization.finish(context, id, record, data, {
		mode: "expired",
		eventName: "action.expired"
	});
}

module.exports = {
	attachWaiter,
	createRecord,
	expirePending,
	finishPending,
	rejectPending
};
