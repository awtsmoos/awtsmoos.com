// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const Envelopes = require("./envelopes.js");
const Lifecycle = require("./lifecycle.js");
const State = require("./state.js");
const Watchdog = require("./requestDispatchWatchdog.js");

/**
 * @file Dispatches only after durable canonical reservation and phase persistence.
 * @description
 * The Awtsmoos places a disk witness before bytes cross the socket. Awtsmoos.com
 * may observe an uncertain delivery after a crash, but it will never erase that
 * uncertainty by blindly repeating a side effect.
 */
async function missing(context, accountId, tunnelName, payload, plan, expected) {
	const data = Envelopes.missingTunnelEnvelope(expected);
	const record = { activityContext: Activity.describe(
		null, accountId, tunnelName, payload, plan.transportId
	) };
	await State.rememberCompleted(context, plan.transportId, data, expected);
	Activity.terminal(context, record, data, "action.failed");
	return data;
}

async function dispatch(options = {}) {
	const {
		context, accountId, tunnelName, tunnel, payload, plan, expected,
		totalTimeoutMs, waitMs
	} = options;
	const record = Lifecycle.createRecord(
		context, plan.transportId, expected, totalTimeoutMs
	);
	record.registrationKey = tunnel.registrationKey;
	record.activityContext = Activity.describe(
		tunnel, accountId, tunnelName, payload, plan.transportId
	);
	record.dispatchEnvelope = envelope(plan, tunnelName);
	Activity.queued(context, record);
	const waiting = Lifecycle.attachWaiter(record, waitMs);
	try {
		const committed = await State.rememberDispatched(
			context, plan.transportId, expected, {
				dispatchedAt: new Date().toISOString(),
				registrationGeneration: tunnel.registrationGeneration || 0
			}
		);
		record.dispatchedAt = committed.dispatchedAt;
		record.dispatchStartedAt = Date.parse(committed.dispatchedAt);
		tunnel.send(record.dispatchEnvelope);
		Watchdog.arm(context, plan.transportId, record, tunnel);
		Activity.dispatched(context, record);
	} catch (error) {
		void Lifecycle.finishPending(
			context, plan.transportId, record,
			Envelopes.sendFailureEnvelope(plan.transportId, expected, error)
		);
	}
	return waiting;
}

function recoverPending(context, tunnel) {
	let recovered = 0;
	for (const [id, record] of context.pendingTunnelRequests || []) {
		if (!eligible(record, tunnel)) continue;
		if (record.requestAcceptedAt) continue;
		if (record.dispatchStartedAt || record.dispatchedAt) {
			Watchdog.arm(context, id, record, tunnel);
			Activity.transition(context, record, "action.awaiting_acceptance", {
				state: "recovering", severity: "notice",
				summary: `${record.activityContext?.action || "action"} awaits prior dispatch acceptance`,
				phase: "registration_reconciliation"
			});
			recovered += 1;
			continue;
		}
		legacyRedispatch(context, id, record, tunnel);
		recovered += 1;
	}
	return recovered;
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
		!record.finalizationPromise && Boolean(record.dispatchEnvelope);
}

function envelope(plan, tunnelName) {
	return { type: "TUNNEL_REQUEST", id: plan.transportId, payload: {
		...plan.tunnelPayload, tunnelName, requestedTunnelName: tunnelName
	} };
}

module.exports = {
	DEFAULT_REQUEST_ACCEPTANCE_MS: Watchdog.DEFAULT_REQUEST_ACCEPTANCE_MS,
	armAcceptance: Watchdog.arm, dispatch, fenceAfterSettlement: Watchdog.fence,
	finishStalledRequest: Watchdog.finish, missing, recoverPending
};
