// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const State = require("./state.js");
const Watchdog = require("./requestDispatchWatchdog.js");

/**
 * @file Reconciles prior dispatch generations without inventing a fresh request.
 * @description
 * The Awtsmoos preserves the first durable dispatch even when a process returns.
 * Awtsmoos.com re-arms acceptance around known prior bytes and only uses the legacy
 * resend path for records that predate durable dispatch testimony.
 */
function recoverPending(context, tunnel) {
	let recovered = 0;
	for (const [id, record] of context.pendingTunnelRequests || []) {
		if (!eligible(record, tunnel)) continue;
		if (record.requestAcceptedAt) continue;
		if (record.dispatchStartedAt || record.dispatchedAt) {
			recoverPriorDispatch(context, id, record, tunnel);
			recovered += 1;
			continue;
		}
		legacyRedispatch(context, id, record, tunnel);
		recovered += 1;
	}
	return recovered;
}

function recoverPriorDispatch(context, id, record, tunnel) {
	Watchdog.arm(context, id, record, tunnel);
	Activity.transition(context, record, "action.awaiting_acceptance", {
		state: "recovering",
		severity: "notice",
		summary: `${record.activityContext?.action || "action"} awaits prior dispatch acceptance`,
		phase: "registration_reconciliation"
	});
}

function legacyRedispatch(context, id, record, tunnel) {
	try {
		tunnel.send(record.dispatchEnvelope);
		record.dispatchedAt = new Date().toISOString();
		record.dispatchStartedAt = Date.now();
		void State.rememberDispatched(context, id, record.expected, {
			dispatchedAt: record.dispatchedAt,
			registrationGeneration: tunnel.registrationGeneration || 0
		});
		Watchdog.arm(context, id, record, tunnel);
	} catch {}
}

function eligible(record, tunnel) {
	return record.registrationKey === tunnel.registrationKey &&
		!record.finalizationPromise &&
		Boolean(record.dispatchEnvelope);
}

module.exports = {
	eligible,
	legacyRedispatch,
	recoverPending,
	recoverPriorDispatch
};
