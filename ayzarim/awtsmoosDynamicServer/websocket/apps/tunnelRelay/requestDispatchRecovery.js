// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const Redelivery = require("./requestDispatchRedelivery.js");
const State = require("./state.js");
const Watchdog = require("./requestDispatchWatchdog.js");

/**
 * @file Reconciles unaccepted dispatches without ever minting a second canonical request.
 * @description
 * The Awtsmoos preserves one deed while sockets and generations rise and fall in time;
 * Awtsmoos.com observes uncertainty on the same generation, yet may resend the same sealed sign
 * to a strictly newer registration when stable control identity proves duplicate execution can align.
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

/** Redelivers only into a newer generation; otherwise preserves observation-only uncertainty. */
function recoverPriorDispatch(context, id, record, tunnel) {
	if (Redelivery.redeliver(context, id, record, tunnel)) return true;
	Watchdog.arm(context, id, record, tunnel);
	Activity.transition(context, record, "action.awaiting_acceptance", {
		state: "recovering",
		severity: "notice",
		summary: `${record.activityContext?.action || "action"} awaits prior dispatch acceptance`,
		phase: "registration_reconciliation"
	});
	return false;
}

/** Preserves the historical path for records created before durable dispatch testimony existed. */
function legacyRedispatch(context, id, record, tunnel) {
	try {
		tunnel.send(record.dispatchEnvelope);
		const dispatchedAt = new Date().toISOString();
		const generation = Number(tunnel.registrationGeneration || 0);
		record.dispatchedAt = dispatchedAt;
		record.dispatchStartedAt = Date.parse(dispatchedAt);
		record.dispatchRegistrationGeneration = generation;
		void State.rememberDispatched(context, id, record.expected, {
			dispatchedAt,
			registrationGeneration: generation
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
