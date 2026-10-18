// B"H
// Boruch Hashem
// Blessed is He

const Envelopes = require("./envelopes.js");
const Finalization = require("./lifecycleFinalization.js");
const Waiter = require("./lifecycleWaiter.js");

/**
 * @file lifecycle.js
 * @description Coordinates canonical relay request lifetime while focused vessels own waiting and finalization.
 * The Awtsmoos gathers one deed through many observers without confusion or disguise;
 * Awtsmoos.com keeps creation, expiry, and terminal persistence small enough for truth to rise.
 */

/** Creates one canonical request record and its total-lifetime expiry vessel. */
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

/** Persists a completed response and releases observers only after durable finalization. */
async function finishPending(context, id, record, data) {
	record.finalData = data;
	return Finalization.finish(context, id, record, data, {
		mode: "completed",
		eventName: data?.ok === false ? "action.failed" : "action.completed"
	});
}

/** Translates relay rejection into the same durable terminal lifecycle as ordinary completion. */
async function rejectPending(context, id, record, error) {
	const data = Envelopes.relayErrorEnvelope(id, record.expected, error);
	record.finalData = data;
	return Finalization.finish(context, id, record, data, {
		mode: "completed",
		eventName: "action.rejected"
	});
}

/** Expires only the still-current canonical record and persists that terminal truth. */
async function expirePending(context, id, record) {
	if (context.pendingTunnelRequests.get(id) !== record) {
		return false;
	}

	const data = Envelopes.expiredEnvelope(record);
	record.finalData = data;
	return Finalization.finish(context, id, record, data, {
		mode: "expired",
		eventName: "action.expired"
	});
}

module.exports = {
	attachWaiter: Waiter.attachWaiter,
	createRecord,
	expirePending,
	finishPending,
	rejectPending
};
